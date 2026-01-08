import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Database } from '@/types/database';

export type Order = Database['public']['Tables']['orders']['Row'] & {
    order_items: (Database['public']['Tables']['order_items']['Row'] & {
        drugs: {
            name: string;
            unit: string;
            image_url: string | null;
        } | null;
    })[];
};

export function useOrders(customerId?: string) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const url = customerId ? `/api/orders?customerId=${customerId}` : '/api/orders';
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch orders');
            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Không thể tải lịch sử đơn hàng');
        } finally {
            setIsLoading(false);
        }
    };

    const createOrder = async (items: any[], totalPrice: number, selectedCustomerId?: string | null, templateId?: string | null) => {
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items, total_price: totalPrice, customer_id: selectedCustomerId, template_id: templateId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create order');
            }

            const newOrder = await response.json();
            // Refresh orders list to include the new one
            await fetchOrders();
            return newOrder;
        } catch (error: any) {
            console.error('Error creating order:', error);
            toast.error(error.message || 'Không thể tạo đơn hàng');
            throw error;
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [customerId]);

    return {
        orders,
        isLoading,
        createOrder,
        refreshOrders: fetchOrders,
    };
}
