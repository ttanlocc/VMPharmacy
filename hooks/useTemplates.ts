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
                .order('created_at', { ascending: false })
                .is('deleted_at', null);

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

    const addTemplate = async (name: string, items: any[], totalPrice?: number, imageUrl?: string, note?: string) => {
        const { data: { user } } = await supabase.auth.getUser();

        // 1. Create template
        const { data: template, error: tError } = await (supabase.from('templates') as any)
            .insert({
                name,
                user_id: user?.id,
                total_price: totalPrice || null,
                image_url: imageUrl || null,
                note: note || null
            } as any)
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
        // Soft delete
        const { error } = await (supabase.from('templates') as any)
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
        setTemplates(templates.filter(t => t.id !== id));
    };

    const updateTemplate = async (id: string, updates: { name?: string, items?: any[], total_price?: number, image_url?: string, note?: string }) => {
        const { error: tError } = await (supabase.from('templates') as any)
            .update({
                name: updates.name,
                total_price: updates.total_price || null,
                image_url: updates.image_url || null,
                note: updates.note || null
            } as any)
            .eq('id', id);

        if (tError) throw tError;

        // If items are provided, replace them
        if (updates.items) {
            // Delete old items
            const { error: dError } = await supabase
                .from('template_items')
                .delete()
                .eq('template_id', id);

            if (dError) throw dError;

            // Insert new items
            if (updates.items.length > 0) {
                const itemsToInsert = updates.items.map(item => ({
                    template_id: id,
                    drug_id: item.drug_id,
                    quantity: item.quantity,
                    note: item.note
                }));

                const { error: iError } = await (supabase.from('template_items') as any)
                    .insert(itemsToInsert);

                if (iError) throw iError;
            }
        }

        await fetchTemplates();
    };

    return { templates, loading, error, refresh: fetchTemplates, addTemplate, updateTemplate, deleteTemplate };
}
