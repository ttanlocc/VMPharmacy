'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

type Template = Database['public']['Tables']['templates']['Row'] & {
    items?: (Database['public']['Tables']['template_items']['Row'] & {
        drugs: Database['public']['Tables']['drugs']['Row']
    })[]
};

export function useTemplates() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('templates')
                .select(`
          *,
          items:template_items(
            *,
            drugs:drugs(*)
          )
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTemplates(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const addTemplate = async (name: string, items: any[]) => {
        const { data: { user } } = await supabase.auth.getUser();

        // 1. Create template
        const { data: template, error: tError } = await (supabase.from('templates') as any)
            .insert({ name, user_id: user?.id } as any)
            .select()
            .single();

        if (tError) throw tError;

        // 2. Create items
        if (items.length > 0) {
            const itemsToInsert = items.map(item => ({
                template_id: template.id,
                drug_id: item.drug_id,
                quantity: item.quantity,
                note: item.note
            }));

            const { error: iError } = await (supabase.from('template_items') as any)
                .insert(itemsToInsert);

            if (iError) throw iError;
        }

        await fetchTemplates();
        return template;
    };

    const deleteTemplate = async (id: string) => {
        const { error } = await supabase.from('templates').delete().eq('id', id);
        if (error) throw error;
        setTemplates(templates.filter(t => t.id !== id));
    };

    return { templates, loading, error, refresh: fetchTemplates, addTemplate, deleteTemplate };
}
