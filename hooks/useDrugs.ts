'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

export type DrugImportPrice = {
    id: string;
    drug_id: string;
    supplier_name: string;
    price: number;
    created_at: string;
};

export type Drug = Database['public']['Tables']['drugs']['Row'] & {
    drug_groups?: { name: string } | null;
    drug_import_prices?: DrugImportPrice[];
};

export function useDrugs() {
    const [drugs, setDrugs] = useState<Drug[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDrugs = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('drugs')
                .select('*, drug_groups(name), drug_import_prices(*)')
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
        // Fetch fresh data to get relations if needed, or just append basic data
        // For simplicity, we can reload or just append. 
        // To get full relations like import prices (empty initially), we might want to just append.
        const newDrug = (data as any)[0];
        setDrugs([...drugs, { ...newDrug, drug_import_prices: [] }]);
        return newDrug;
    };

    const updateDrug = async (id: string, updates: Database['public']['Tables']['drugs']['Update']) => {
        const { data, error } = await (supabase.from('drugs') as any).update(updates).eq('id', id).select();
        if (error) throw error;

        // optimistic update preservation of relations
        setDrugs(drugs.map(d => {
            if (d.id === id) {
                return { ...d, ...((data as any)[0]) };
            }
            return d;
        }));
        return (data as any)[0];
    };

    const deleteDrug = async (id: string) => {
        const { error } = await (supabase.from('drugs') as any)
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);
        if (error) throw error;
        setDrugs(drugs.filter(d => d.id !== id));
    };

    const addImportPrice = async (priceData: { drug_id: string, supplier_name: string, price: number }) => {
        const { data, error } = await (supabase.from('drug_import_prices') as any).insert(priceData).select();
        if (error) throw error;

        const newPrice = (data as any)[0];
        setDrugs(drugs.map(d => {
            if (d.id === priceData.drug_id) {
                return {
                    ...d,
                    drug_import_prices: [...(d.drug_import_prices || []), newPrice]
                };
            }
            return d;
        }));
        return newPrice;
    };

    const deleteImportPrice = async (priceId: string, drugId: string) => {
        const { error } = await supabase.from('drug_import_prices').delete().eq('id', priceId);
        if (error) throw error;

        setDrugs(drugs.map(d => {
            if (d.id === drugId) {
                return {
                    ...d,
                    drug_import_prices: (d.drug_import_prices || []).filter(p => p.id !== priceId)
                };
            }
            return d;
        }));
    };

    return {
        drugs,
        loading,
        error,
        refresh: fetchDrugs,
        addDrug,
        updateDrug,
        deleteDrug,
        addImportPrice,
        deleteImportPrice
    };
}
