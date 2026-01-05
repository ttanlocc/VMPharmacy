'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

type Drug = Database['public']['Tables']['drugs']['Row'];

export function useDrugs() {
    const [drugs, setDrugs] = useState<Drug[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDrugs = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('drugs')
                .select('*, drug_groups(name)')
                .order('name');

            if (error) throw error;
            setDrugs(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrugs();
    }, []);

    const addDrug = async (drug: Database['public']['Tables']['drugs']['Insert']) => {
        const { data, error } = await (supabase.from('drugs') as any).insert(drug).select();
        if (error) throw error;
        setDrugs([...drugs, (data as any)[0]]);
        return (data as any)[0];
    };

    const updateDrug = async (id: string, updates: Database['public']['Tables']['drugs']['Update']) => {
        const { data, error } = await (supabase.from('drugs') as any).update(updates).eq('id', id).select();
        if (error) throw error;
        setDrugs(drugs.map(d => d.id === id ? (data as any)[0] : d));
        return (data as any)[0];
    };

    const deleteDrug = async (id: string) => {
        const { error } = await supabase.from('drugs').delete().eq('id', id);
        if (error) throw error;
        setDrugs(drugs.filter(d => d.id !== id));
    };

    return { drugs, loading, error, refresh: fetchDrugs, addDrug, updateDrug, deleteDrug };
}
