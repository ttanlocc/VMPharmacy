'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit2, Copy, Trash2, Pill, ShoppingBag, ClipboardList } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { formatCurrency, cn } from '@/lib/utils';

export type PreviewType = 'drug' | 'template';

interface ActionMenuProps {
    isOpen: boolean;
    onClose: () => void;
    type: PreviewType;
    data: any;
    actions: {
        label: string;
        icon: React.ReactNode;
        onClick: () => void;
        variant?: 'default' | 'danger' | 'primary';
    }[];
}

export function ActionMenu({ isOpen, onClose, type, data, actions }: ActionMenuProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!mounted) return null;

    const renderDrugPreview = () => (
        <div className="flex flex-col">
            {/* Header: Image + Name + Group */}
            <div className="flex gap-4 p-4 items-start">
                <div className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                    {data.image_url ? (
                        <img src={data.image_url} alt={data.name} className="w-full h-full object-cover" />
                    ) : (
                        <Pill size={32} className="text-slate-300" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-[17px] font-semibold text-slate-900 leading-tight mb-1">{data.name}</h3>
                    <div className="h-px bg-slate-100 w-full my-2" />
                    {data.drug_groups?.name ? (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-sky-50 text-sky-600 text-[11px] font-bold uppercase tracking-wider">
                            {data.drug_groups.name}
                        </span>
                    ) : (
                        <span className="text-slate-400 text-xs">Chưa phân nhóm</span>
                    )}
                </div>
            </div>

            <div className="px-4 pb-4 space-y-4">
                {/* Active Ingredient */}
                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">💊 Hoạt chất</label>
                    <p className="text-[15px] font-medium text-slate-700">{data.active_ingredient || '—'}</p>
                </div>

                {/* Price & Unit */}
                <div className="flex gap-8">
                    <div className="flex-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">💰 Giá bán</label>
                        <p className="text-[18px] font-black text-sky-500">{formatCurrency(data.unit_price)} đ</p>
                    </div>
                    <div className="shrink-0 min-w-[60px]">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">📦 Đơn vị</label>
                        <p className="text-[15px] font-bold text-slate-700 uppercase">{data.unit}</p>
                    </div>
                </div>

                {/* Optional Note */}
                {data.note && (
                    <div className="pt-2 border-t border-slate-50">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">📝 Ghi chú</label>
                        <p className="text-[13px] text-slate-500 italic leading-relaxed">{data.note}</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderTemplatePreview = () => {
        const total = data.total_price !== null
            ? Number(data.total_price)
            : (data.items?.reduce((sum: number, item: any) => sum + ((item.custom_price || item.drugs?.unit_price || 0) * item.quantity), 0) || 0);

        return (
            <div className="flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-slate-50">
                    <div className="flex items-center gap-2 mb-3">
                        <ClipboardList className="text-indigo-500" size={20} />
                        <h3 className="text-[17px] font-semibold text-slate-900">{data.name}</h3>
                    </div>
                    <div className="flex justify-between items-end">
                        <div className="flex-1">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Giá bán</label>
                            <p className="text-[18px] font-black text-indigo-600">{formatCurrency(total)} đ</p>
                        </div>
                        <div className="text-right">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Số loại thuốc</label>
                            <p className="text-[15px] font-bold text-slate-700">{data.items?.length || 0} loại</p>
                        </div>
                    </div>
                </div>

                {/* Drug List Table */}
                <div className="p-4 bg-slate-50/50">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Chi tiết đơn thuốc:</label>
                    <div className="space-y-1.5 ring-1 ring-slate-100 rounded-xl overflow-hidden bg-white">
                        {data.items?.slice(0, 4).map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 p-2 hover:bg-slate-50 transition-colors border-b last:border-0 border-slate-50">
                                <div className="w-9 h-9 rounded-lg bg-slate-50 shrink-0 overflow-hidden border border-slate-100 flex items-center justify-center">
                                    {item.drugs?.image_url ? (
                                        <img src={item.drugs.image_url} className="w-full h-full object-cover" />
                                    ) : (
                                        <Pill size={14} className="text-slate-300" />
                                    )}
                                </div>
                                <span className="flex-1 text-[13px] font-medium text-slate-700 truncate">{item.drugs?.name}</span>
                                <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 rounded-md text-slate-500">x{item.quantity}</span>
                            </div>
                        ))}
                        {data.items?.length > 4 && (
                            <div className="p-2 text-center text-[11px] font-medium text-slate-400 bg-slate-50/50">
                                và {data.items.length - 4} loại thuốc khác...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[80]"
                    />

                    {/* Messenger Style Popup */}
                    <div className="fixed inset-0 z-[90] pointer-events-none flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 8 }}
                            transition={{ type: "spring", duration: 0.2, damping: 25, stiffness: 300 }}
                            className="w-full max-w-[320px] pointer-events-auto bg-white/98 backdrop-blur-[20px] rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col"
                        >
                            {/* Main Content */}
                            {type === 'drug' ? renderDrugPreview() : renderTemplatePreview()}

                            {/* Actions Footer */}
                            <div className="p-4 pt-0 mt-2 flex gap-2">
                                {actions.map((action, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            action.onClick();
                                            onClose();
                                        }}
                                        className={cn(
                                            "h-10 px-3 rounded-xl font-bold text-[13px] transition-all flex items-center justify-center gap-1.5 active:scale-95 flex-1",
                                            action.variant === 'danger'
                                                ? "bg-red-50 text-red-500 hover:bg-red-100"
                                                : action.variant === 'primary'
                                                    ? "bg-sky-500 text-white shadow-lg shadow-sky-100"
                                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        )}
                                    >
                                        <span className="shrink-0">{action.icon}</span>
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
