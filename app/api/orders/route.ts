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

export async function GET() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
        .from('orders')
        .select(`
      *,
      order_items (
        *,
        drugs (name, unit, image_url)
      )
    `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const { total_price, items } = await request.json();

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
            status: 'completed'
        }])
        .select()
        .single();

    if (orderError) {
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
        return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    return NextResponse.json(order);
}
