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
    const { total_price, items, customer_id } = await request.json();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Create Order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
            user_id: user.id,
            total_price,
            status: 'completed',
            customer_id: customer_id || null
        }])
        .select()
        .single();

    if (orderError) {
        console.error("API POST /api/orders (create order) Error:", orderError);
        return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // 2. Create Order Items
    const orderItems = items.map((item: any) => ({
        order_id: order.id,
        drug_id: item.drug_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        note: item.note
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
