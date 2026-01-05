'use client';

import { useState } from 'react';
import Container from '@/components/Container';
import HistoryFilter from '@/components/HistoryFilter';
import { useHistory } from '@/hooks/useHistory';
import { formatCurrency } from '@/lib/utils';
import { Calendar, Package, ChevronDown, ChevronUp, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function HistoryPage() {
    const { orders, loading, filters, updateFilters } = useHistory();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <Container>
            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Lịch sử</h1>
                        <p className="text-slate-500 text-sm font-medium">Quản lý đơn hàng đã bán</p>
                    </div>
                </div>

                <HistoryFilter filters={filters} onChange={updateFilters} />

                {loading ? (
                    <LoadingSpinner label="Đang tải lịch sử..." className="mt-10" />
                ) : (
                    orders.length === 0 ? (
                        <div className="text-center py-20 text-slate-400 bg-white/50 border-2 border-dashed border-slate-200 rounded-[2rem]">
                            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="font-bold">Không tìm thấy đơn hàng nào</p>
                            <p className="text-sm">Thử thay đổi bộ lọc tìm kiếm</p>
                        </div>
                    ) : (
                        <div className="space-y-4 pb-20">
                            {orders.map((order) => (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div
                                        onClick={() => toggleExpand(order.id)}
                                        className="p-5 flex items-center justify-between cursor-pointer active:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                                <Calendar size={12} />
                                                {new Date(order.created_at).toLocaleDateString('vi-VN', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </div>

                                            {order.customers && (
                                                <div className="flex items-center gap-2 text-sky-600">
                                                    <div className="h-5 w-5 rounded-full bg-sky-50 flex items-center justify-center">
                                                        <User size={12} />
                                                    </div>
                                                    <span className="text-sm font-bold">{order.customers.name}</span>
                                                    <span className="text-xs text-sky-400 font-medium">({order.customers.phone})</span>
                                                </div>
                                            )}

                                            <div className="font-black text-slate-900 text-lg">
                                                {formatCurrency(order.total_price)}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${order.status === 'completed'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                {order.status === 'completed' ? 'Hoàn thành' : order.status}
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
                                                <div className="p-5 space-y-3">
                                                    {order.order_items.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className="flex items-center justify-between text-sm group"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-8 w-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0">
                                                                    {item.drugs?.image_url ? (
                                                                        <img src={item.drugs.image_url} className="h-full w-full object-cover rounded-lg" />
                                                                    ) : null}
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-slate-700">
                                                                        {item.drugs?.name || 'Thuốc đã xóa'}
                                                                    </div>
                                                                    <div className="text-xs text-slate-400 font-medium">
                                                                        {item.quantity} {item.drugs?.unit} x {formatCurrency(item.unit_price)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-slate-900 font-bold">
                                                                {formatCurrency(item.unit_price * item.quantity)}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {order.customers?.medical_history && (
                                                        <div className="mt-4 pt-4 border-t border-slate-200/50">
                                                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Ghi chú / Tiền sử</p>
                                                            <p className="text-sm text-slate-600">{order.customers.medical_history}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </Container>
    );
}
