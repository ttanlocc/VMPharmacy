import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Database } from '@/types/database';

export async function GET(request: Request) {
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query = supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

    if (search) {
        query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, birth_year, medical_history, note } = body;

    if (!name || !phone) {
        return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('customers')
        .insert({
            name,
            phone,
            birth_year: birth_year || null,
            medical_history: medical_history || null,
            note: note || null
        } as any)
        .select()
        .single();

    if (error) {
        // Handle unique constraint violation for phone
        if (error.code === '23505') {
            return NextResponse.json({ error: 'Số điện thoại này đã tồn tại' }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function PUT(request: Request) {
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, phone, birth_year, medical_history, note } = body;

    if (!id || !name || !phone) {
        return NextResponse.json({ error: 'ID, Name, and Phone are required' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('customers')
        // @ts-ignore
        .update({
            name,
            phone,
            birth_year: birth_year || null,
            medical_history: medical_history || null,
            note: note || null
        } as any)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            return NextResponse.json({ error: 'Số điện thoại này đã tồn tại' }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
