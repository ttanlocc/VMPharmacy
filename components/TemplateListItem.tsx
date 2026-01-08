import { ClipboardList, Pill, MoreVertical, ShoppingBag } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { useLongPress } from '@/components/useLongPress';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import React from 'react';
import DetailedDrugList from './DetailedDrugList';

interface TemplateListItemProps {
    template: any;
    index: number;
    onClick: (template: any) => void;
    onContextMenu: (e: React.MouseEvent, template: any) => void;
    onLongPress: (template: any) => void;
    onMoreClick?: (template: any) => void;
    onCreateOrder?: (template: any) => void;
    isExpanded?: boolean;
    onToggle?: (template: any) => void;
}

export default function TemplateListItem({
    template,
    index,
    onClick,
    onContextMenu,
    onLongPress,
    onMoreClick,
    onCreateOrder,
    isExpanded = false,
    onToggle
}: TemplateListItemProps) {
    const longPressHandlers = useLongPress(() => {
        onLongPress(template);
    });

    const total = template.total_price !== null
        ? Number(template.total_price)
        : (template.items?.reduce((sum: number, item: any) => sum + ((item.custom_price || item.drugs?.unit_price || 0) * item.quantity), 0) || 0);

    const handleCardClick = () => {
        if (onToggle) {
            onToggle(template);
        } else {
            onClick(template);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.05 }}
            onClick={handleCardClick}
            onContextMenu={(e) => onContextMenu(e, template)}
            {...longPressHandlers}
            className="cursor-pointer group relative"
        >
            <div className={`flex flex-col bg-white border rounded-2xl transition-all ${isExpanded ? 'border-indigo-200 ring-1 ring-indigo-50 shadow-sm' : 'border-slate-100 hover:border-indigo-200'}`}>
                {/* Main Row */}
                <div className="flex items-start gap-3 p-3">
                    {/* Image Section */}
                    <div className="h-14 w-14 bg-slate-100 rounded-xl overflow-hidden shrink-0 relative">
                        {template.image_url ? (
                            <img
                                src={template.image_url}
                                className="w-full h-full object-cover"
                                alt={template.name}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <ClipboardList className="text-indigo-200" size={24} />
                            </div>
                        )}
                    </div>

                    {/* Content Section - More space for Name */}
                    <div className="flex-1 min-w-0 pt-0.5">
                        <h3 className="font-bold text-slate-900 leading-tight mb-1">
                            {template.name}
                        </h3>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-500 px-2 py-0.5 bg-slate-100 rounded-full uppercase tracking-wider flex items-center gap-1 shrink-0">
                                <Pill size={10} />
                                {template.items?.length || 0} thuốc
                            </span>
                            <p className="font-black text-indigo-600 text-sm">
                                {formatCurrency(total)}
                            </p>
                        </div>
                    </div>

                    {/* Actions only - Shrink to minimum */}
                    <div className="flex items-center gap-1 shrink-0">
                        {onCreateOrder && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCreateOrder(template);
                                }}
                                className="p-2 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors"
                                title="Tạo đơn hàng ngay"
                            >
                                <ShoppingBag size={18} />
                            </button>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onMoreClick) onMoreClick(template);
                            }}
                            className="p-2 text-slate-300 hover:text-slate-500 rounded-full hover:bg-slate-50 transition-colors"
                        >
                            <MoreVertical size={20} />
                        </button>
                    </div>
                </div>

                {/* Expanded Section */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="px-4 pb-4 pt-1 border-t border-slate-50">
                                {template.note && (
                                    <div className="mb-3 p-3 bg-amber-50 text-amber-700 text-xs rounded-xl flex gap-2 items-start border border-amber-100">
                                        <div className="mt-0.5 shrink-0">📝</div>
                                        <p className="font-medium">{template.note}</p>
                                    </div>
                                )}
                                <DetailedDrugList
                                    items={template.items?.map((item: any) => ({
                                        name: item.drugs?.name || 'Thuốc đã xóa',
                                        unit: item.drugs?.unit || 'đơn vị',
                                        quantity: item.quantity,
                                        price: item.custom_price || item.drugs?.unit_price,
                                        image_url: item.drugs?.image_url
                                    })) || []}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

