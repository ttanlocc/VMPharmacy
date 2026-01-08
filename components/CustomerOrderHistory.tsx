'use client';

import { useOrders, Order } from '@/hooks/useOrders';
import { formatCurrency } from '@/lib/utils';
import { useCheckout, CheckoutItem } from '@/app/context/CheckoutContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { History, ShoppingCart, Clock, Pill, ChevronRight, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface Customer {
    id: string;
    name: string;
    phone: string;
    birth_year?: number | null;
    medical_history?: string | null;
}

interface CustomerOrderHistoryProps {
    customerId: string;
    customer: Customer;
}

export default function CustomerOrderHistory({ customerId, customer }: CustomerOrderHistoryProps) {
    const { orders, isLoading } = useOrders(customerId);
    const { clearCheckout, setCustomer, addItems } = useCheckout();
    const router = useRouter();

    const handleReorder = async (order: Order) => {
        const loadingToast = toast.loading('Đang chuẩn bị đơn hàng...');
        try {
            // Get current prices for all drugs in the order
            const drugIds = order.order_items.map(oi => oi.drug_id).filter((id): id is string => !!id);
            const { data: currentDrugs, error } = await supabase
                .from('drugs')
                .select('*')
                .in('id', drugIds);

            if (error) throw error;

            const typedDrugs = (currentDrugs as any[]) || [];
            const drugMap = new Map<string, any>(typedDrugs.map(d => [d.id, d]));

            const newItems: CheckoutItem[] = order.order_items.map(oi => {
                const currentDrug = oi.drug_id ? drugMap.get(oi.drug_id) : null;
                const typedDrug = currentDrug as any;
                return {
                    name: typedDrug?.name || oi.drugs?.name || 'Thuốc không xác định',
                    price: typedDrug?.unit_price || oi.unit_price,
                    quantity: oi.quantity,
                    type: 'drug',
                    drug_id: oi.drug_id!,
                    unit: typedDrug?.unit || oi.drugs?.unit || 'đơn vị',
                    image: typedDrug?.image_url || oi.drugs?.image_url || null,
                    note: oi.note || ''
                };
            });

            clearCheckout();
            setCustomer(customer as any);
            addItems(newItems);

            toast.success('Đã tải lại đơn hàng!', { id: loadingToast });
            router.push('/checkout');
        } catch (error) {
            console.error('Reorder error:', error);
            toast.error('Không thể tải lại đơn hàng này', { id: loadingToast });
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
                <Loader2 size={32} className="animate-spin text-primary" />
                <p className="font-medium">Đang tải lịch sử...</p>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                    <History size={32} />
                </div>
                <div>
                    <h4 className="font-bold text-slate-900">Chưa có đơn hàng</h4>
                    <p className="text-sm text-slate-500 max-w-[200px] mt-1">Khách hàng này chưa thực hiện giao dịch nào.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Đơn hàng gần đây</h4>
                <span className="text-xs font-bold text-slate-400">{orders.length} đơn</span>
            </div>

            <div className="space-y-3">
                {orders.map((order, idx) => (
                    <motion.div
                        key={order.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white border border-slate-100 rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-md hover:border-sky-100 transition-all p-4"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2 text-slate-500">
                                <Clock size={14} />
                                <span className="text-xs font-bold uppercase tracking-tight">
                                    {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: vi })}
                                </span>
                            </div>
                            <span className="text-xs font-black text-primary bg-sky-50 px-2 py-0.5 rounded-full">
                                {formatCurrency(order.total_price)}
                            </span>
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex -space-x-2">
                                {order.order_items.slice(0, 3).map((oi, i) => (
                                    <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-slate-50 overflow-hidden shadow-sm flex items-center justify-center">
                                        {oi.drugs?.image_url ? (
                                            <img src={oi.drugs.image_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <Pill size={16} className="text-slate-300" />
                                        )}
                                    </div>
                                ))}
                                {order.order_items.length > 3 && (
                                    <div className="h-10 w-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 shadow-sm relative z-0">
                                        +{order.order_items.length - 3}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 line-clamp-1">
                                    {order.order_items.map(oi => oi.drugs?.name).join(', ')}
                                </p>
                                <p className="text-[10px] text-slate-500 font-medium">
                                    {order.order_items.length} mặt hàng
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => handleReorder(order)}
                            className="w-full py-3 bg-slate-900 hover:bg-primary text-white rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 group shadow-lg shadow-slate-200"
                        >
                            <ShoppingCart size={18} className="group-hover:animate-bounce" />
                            <span>MUA LẠI</span>
                            <ChevronRight size={16} className="ml-1 opacity-50" />
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
