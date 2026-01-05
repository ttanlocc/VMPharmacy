import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
        .from('templates')
        .select('*, template_items(*, drugs(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, items } = await request.json();

    // 1. Create Template
    const { data: template, error: templateError } = await supabase
        .from('templates')
        .insert({ name, user_id: user.id } as any)
        .select()
        .single();

    if (templateError || !template) {
        return NextResponse.json({ error: templateError?.message || 'Failed to create template' }, { status: 500 });
    }

    // 2. Create Template Items
    if (items && items.length > 0) {
        const templateItems = items.map((item: any) => ({
            template_id: (template as any).id,
            drug_id: item.drug_id,
            quantity: item.quantity,
            note: item.note
        }));

        const { error: itemsError } = await supabase
            .from('template_items')
            .insert(templateItems as any);

        if (itemsError) {
            return NextResponse.json({ error: itemsError.message }, { status: 500 });
        }
    }

    return NextResponse.json(template);
}
