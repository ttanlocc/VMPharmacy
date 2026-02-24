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
    const customerId = searchParams.get('customerId');

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
    if (customerId) {
        query = query.eq('customer_id', customerId);
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

    // Validate: Filter out items with missing drug_id
    const validItems = items.filter((item: any) => item.drug_id);

    if (validItems.length === 0) {
        return NextResponse.json({ error: 'Không có sản phẩm hợp lệ để tạo đơn hàng' }, { status: 400 });
    }

    // Validate: Check if all drug_ids exist in database
    const drugIds = validItems.map((i: any) => i.drug_id);
    const { data: existingDrugs } = await supabase
        .from('drugs')
        .select('id')
        .in('id', drugIds)
        .is('deleted_at', null);

    const existingDrugIds = new Set(existingDrugs?.map(d => d.id) || []);
    const finalValidItems = validItems.filter((item: any) => existingDrugIds.has(item.drug_id));

    if (finalValidItems.length === 0) {
        return NextResponse.json({ error: 'Tất cả sản phẩm trong đơn hàng không tồn tại hoặc đã bị xóa' }, { status: 400 });
    }

    let finalTotalPrice = requestTotalPrice;
    let finalItems = [...finalValidItems];

    // Handle Template Pricing Distribution
    if (template_id) {
        // 1. Fetch template is still useful if we want to validte existence or get other metadata, 
        // but for price, we now respect the request's total_price (allowing per-order override).

        // We still need to fetch drugs to get standard prices for ratio calculation
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



    // Create order + items atomically via RPC.
    // If the order_items insert fails, the entire transaction rolls back — no orphaned orders.
    const { data: order, error: orderError } = await supabase.rpc('create_order_atomic', {
        p_user_id: user.id,
        p_total_price: finalTotalPrice,
        p_customer_id: customer_id || null,
        p_template_id: template_id || null,
        p_items: finalItems.map((item: any) => ({
            drug_id: item.drug_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            note: item.note || null,
            template_id: template_id || null,
        })),
    });

    if (orderError) {
        console.error("API POST /api/orders (create_order_atomic) Error:", orderError);
        return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    return NextResponse.json(order);
}
