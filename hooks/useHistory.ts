import { useState, useEffect, useCallback } from 'react';
import { Database } from '@/types/database';
import toast from 'react-hot-toast';

export type OrderWithDetails = Database['public']['Tables']['orders']['Row'] & {
    customers: { name: string; phone: string } | null;
    order_items: (Database['public']['Tables']['order_items']['Row'] & {
        drugs: {
            name: string;
            unit: string;
            image_url: string | null;
        } | null;
    })[];
};

export interface HistoryFilters {
    search?: string;
    dateFrom?: string;
    dateTo?: string;
}

export function useHistory() {
    const [orders, setOrders] = useState<OrderWithDetails[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<HistoryFilters>({});

    const fetchOrders = useCallback(async (currentFilters: HistoryFilters) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (currentFilters.search) params.append('search', currentFilters.search);
            if (currentFilters.dateFrom) params.append('dateFrom', currentFilters.dateFrom);
            if (currentFilters.dateTo) params.append('dateTo', currentFilters.dateTo);

            const res = await fetch(`/api/orders?${params.toString()}`);
            const data = await res.json();

            if (res.ok) {
                setOrders(data);
            } else {
                throw new Error(data.error);
            }
        } catch (error: any) {
            console.error('Fetch history error:', error);
            toast.error('Không thể tải lịch sử mua hàng');
        } finally {
            setLoading(false);
        }
    }, []);

    const updateFilters = (newFilters: HistoryFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            fetchOrders(filters);
        }, 500);
        return () => clearTimeout(timer);
    }, [filters, fetchOrders]);

    return {
        orders,
        loading,
        filters,
        updateFilters,
        refresh: () => fetchOrders(filters)
    };
}
