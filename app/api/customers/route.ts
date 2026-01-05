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
                        // Ignored
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options });
                    } catch (error) {
                        // Ignored
                    }
                },
            },
        }
    );
}

export async function GET(request: Request) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query = supabase.from('customers').select('*').order('created_at', { ascending: false });

    if (search) {
        // Search by name (case-insensitive) or phone (exact or partial)
        // Using ilike for name and phone
        query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data, error } = await query.limit(20);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const body = await request.json();
    const { name, phone, birth_year, medical_history } = body;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!name || !phone) {
        return NextResponse.json({ error: 'Name and Phone are required' }, { status: 400 });
    }

    // Check if phone already exists
    const { data: existing } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', phone)
        .maybeSingle();

    if (existing) {
        return NextResponse.json({ error: 'Phone number already exists' }, { status: 409 });
    }

    const { data, error } = await supabase
        .from('customers')
        .insert({
            name,
            phone,
            birth_year,
            medical_history
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
