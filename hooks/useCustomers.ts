import { useState, useEffect, useCallback } from 'react';
import { Database } from '@/types/database';

type Customer = Database['public']['Tables']['customers']['Row'];
type NewCustomer = Database['public']['Tables']['customers']['Insert'];

export function useCustomers() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCustomers = useCallback(async (search?: string) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);

            const res = await fetch(`/api/customers?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch customers');

            const data = await res.json();
            setCustomers(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const createCustomer = async (newCustomer: NewCustomer) => {
        setLoading(true);
        try {
            const res = await fetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCustomer),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to create customer');
            }

            const data = await res.json();
            // Optimistically update list or refetch
            setCustomers(prev => [data, ...prev]);
            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        customers,
        loading,
        error,
        searchCustomers: fetchCustomers,
        createCustomer,
        updateCustomer: async (customer: Customer) => {
            setLoading(true);
            try {
                const res = await fetch('/api/customers', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(customer),
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Failed to update customer');
                }

                const data = await res.json();
                setCustomers(prev => prev.map(c => c.id === data.id ? data : c));
                return data;
            } catch (err: any) {
                setError(err.message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
    };
}
