import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options });
                    } catch (error) {
                        // Ignored in Server Components
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options });
                    } catch (error) {
                        // Ignored in Server Components
                    }
                },
            },
        }
    );
}

export async function GET(request: Request) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const search = searchParams.get('search');

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query = supabase
        .from('orders')
        .select(`
      *,
      customers (name, phone, medical_history),
      order_items (
        *,
        drugs (name, unit, image_url)
      )
    `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (dateFrom) {
        query = query.gte('created_at', `${dateFrom}T00:00:00.000Z`);
    }
    if (dateTo) {
        query = query.lte('created_at', `${dateTo}T23:59:59.999Z`);
    }
    // Search by customer name or phone is complex with joined tables in simple queries.
    // We will do basic filtering on the customer_id if provided, 
    // OR rely on client-side filtering for complex text search if strict RLS allows.
    // For now, let's support direct customer_id matching if passed, or rely on fetching all.

    // However, if 'search' is passed, we might want to filter customers.
    // Supabase supports !inner join filtering.
    if (search) {
        // This requires the join to be !inner to filter out orders where customer doesn't match
        query = supabase
            .from('orders')
            .select(`
              *,
              customers!inner (name, phone, medical_history),
              order_items (
                *,
                drugs (name, unit, image_url)
              )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .or(`name.ilike.%${search}%,phone.ilike.%${search}%`, { foreignTable: 'customers' });
    }

    const { data, error } = await query;

    if (error) {
        console.error("API GET /api/orders Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const { total_price: requestTotalPrice, items, customer_id, template_id } = await request.json();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let finalTotalPrice = requestTotalPrice;
    let finalItems = [...items];

    // Handle Template Pricing Distribution
    if (template_id) {
        // 1. Fetch template is still useful if we want to validte existence or get other metadata, 
        // but for price, we now respect the request's total_price (allowing per-order override).

        // We still need to fetch drugs to get standard prices for ratio calculation
        const drugIds = items.map((i: any) => i.drug_id);
        const { data: drugs } = await supabase
            .from('drugs')
            .select('id, unit_price')
            .in('id', drugIds);

        const drugPriceMap = new Map(drugs?.map((d: any) => [d.id, Number(d.unit_price)]) || []);

        // 2. Use the requested total_price as the manual price to distribute
        // This covers both "Template Default Price" (sent by client) and "Manual Override" (sent by client)
        const manualPrice = Number(finalTotalPrice);

        // Calculate Standard Sum
        let standardSum = 0;
        finalItems.forEach((item: any) => {
            const standardPrice = drugPriceMap.get(item.drug_id) || 0;
            standardSum += standardPrice * item.quantity;
        });

        // Distribute
        let distributedSum = 0;
        finalItems = finalItems.map((item: any, index: number) => {
            const standardPrice = drugPriceMap.get(item.drug_id) || 0;
            const itemTotalStandard = standardPrice * item.quantity;

            let ratio = 0;
            if (standardSum > 0) {
                ratio = itemTotalStandard / standardSum;
            } else {
                // If all drugs are free, distribute evenly
                ratio = 1 / finalItems.length;
            }

            // Calculate subtotal for this line item (unit_price * quantity)
            // We need unit_price, so: (ratio * manualPrice) / quantity
            let lineTotal = Math.round(ratio * manualPrice);

            // Adjustment for last item to handle rounding errors
            if (index === finalItems.length - 1) {
                lineTotal = manualPrice - distributedSum;
            } else {
                distributedSum += lineTotal;
            }

            // Set new unit price (approximate, preserving lineTotal)
            const newUnitPrice = lineTotal / item.quantity;

            return {
                ...item,
                unit_price: newUnitPrice
            };
        });
    }



    // 1. Create Order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
            user_id: user.id,
            total_price: finalTotalPrice,
            status: 'completed',
            customer_id: customer_id || null,
            template_id: template_id || null
        }])
        .select()
        .single();

    if (orderError) {
        console.error("API POST /api/orders (create order) Error:", orderError);
        return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // 2. Create Order Items
    const orderItems = finalItems.map((item: any) => ({
        order_id: order.id,
        drug_id: item.drug_id,
        quantity: item.quantity,
        unit_price: item.unit_price, // Saved as snapshot (distributed if template)
        note: item.note,
        template_id: template_id || null // Store template_id on items too per plan
    }));

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

    if (itemsError) {
        // In a real app we might want to rollback the order here
        console.error("API POST /api/orders (create items) Error:", itemsError);
        return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    return NextResponse.json(order);
}
