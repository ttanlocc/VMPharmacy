'use client';

import { useOrders } from '@/hooks/useOrders';
import { formatCurrency } from '@/lib/utils';
import { Calendar, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DetailedDrugList from './DetailedDrugList';

export default function OrderHistory() {
    const { orders, isLoading } = useOrders();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (isLoading) {
        return <div className="text-center py-4 text-slate-400">Đang tải lịch sử...</div>;
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Chưa có đơn hàng nào</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <div
                    key={order.id}
                    className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm"
                >
                    <div
                        onClick={() => toggleExpand(order.id)}
                        className="p-4 flex items-center justify-between cursor-pointer active:bg-slate-50 transition-colors"
                    >
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                                <Calendar size={12} />
                                {new Date(order.created_at).toLocaleDateString('vi-VN', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </div>
                            <div className="font-bold text-slate-900">
                                {formatCurrency(order.total_price)}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full">
                                Hoàn thành
                            </div>
                            {expandedId === order.id ? (
                                <ChevronUp size={20} className="text-slate-400" />
                            ) : (
                                <ChevronDown size={20} className="text-slate-400" />
                            )}
                        </div>
                    </div>

                    <AnimatePresence>
                        {expandedId === order.id && (
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                exit={{ height: 0 }}
                                className="overflow-hidden bg-slate-50/50 border-t border-slate-100"
                            >
                                <div className="p-4 pt-2">
                                    <DetailedDrugList
                                        items={order.order_items.map((item) => ({
                                            name: item.drugs?.name || 'Thuốc đã xóa',
                                            unit: item.drugs?.unit || 'đơn vị',
                                            quantity: item.quantity,
                                            price: Number(item.unit_price),
                                            image_url: item.drugs?.image_url
                                        }))}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            ))}
        </div>
    );
}
