import { useState, useCallback } from 'react';
import { Database } from '@/types/database';
import toast from 'react-hot-toast';

type Customer = Database['public']['Tables']['customers']['Row'];
type NewCustomer = Database['public']['Tables']['customers']['Insert'];

export function useCustomers() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);

    const searchCustomers = useCallback(async (query: string) => {
        if (!query.trim()) {
            setCustomers([]);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/customers?search=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (res.ok) {
                setCustomers(data);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Search error:', error);
            // toast.error('Lỗi tìm kiếm khách hàng');
        } finally {
            setLoading(false);
        }
    }, []);

    const createCustomer = async (customer: NewCustomer): Promise<Customer | null> => {
        setLoading(true);
        try {
            const res = await fetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customer),
            });
            const data = await res.json();
            if (res.ok) {
                return data;
            } else {
                throw new Error(data.error);
            }
        } catch (error: any) {
            console.error('Create customer error:', error);
            toast.error(error.message || 'Lỗi tạo khách hàng');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        customers,
        loading,
        searchCustomers,
        createCustomer
    };
}
