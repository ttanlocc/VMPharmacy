import { ClipboardList, Pill, MoreVertical, ShoppingBag } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { useLongPress } from '@/components/useLongPress';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import React from 'react';

interface TemplateListItemProps {
    template: any;
    index: number;
    onClick: (template: any) => void;
    onContextMenu: (e: React.MouseEvent, template: any) => void;
    onLongPress: (template: any) => void;
    onMoreClick?: (template: any) => void;
    onCreateOrder?: (template: any) => void;
}

export default function TemplateListItem({ template, index, onClick, onContextMenu, onLongPress, onMoreClick, onCreateOrder }: TemplateListItemProps) {
    const longPressHandlers = useLongPress(() => {
        onLongPress(template);
    });

    const total = template.total_price !== null
        ? Number(template.total_price)
        : (template.items?.reduce((sum: number, item: any) => sum + ((item.custom_price || item.drugs?.unit_price || 0) * item.quantity), 0) || 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onClick(template)}
            onContextMenu={(e) => onContextMenu(e, template)}
            {...longPressHandlers}
            className="cursor-pointer group relative"
        >
            <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 transition-colors">
                {/* Image Section */}
                <div className="h-16 w-16 bg-slate-100 rounded-xl overflow-hidden shrink-0 relative">
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

                {/* Content Section */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 truncate mb-1">
                        {template.name}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500 px-2 py-0.5 bg-slate-100 rounded-full uppercase tracking-wider flex items-center gap-1">
                            <Pill size={10} />
                            {template.items?.length || 0} thuốc
                        </span>
                        {template.total_price !== null && (
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Thủ công
                            </span>
                        )}
                    </div>
                </div>

                {/* Price & Actions */}
                <div className="flex items-center gap-3">
                    <p className="font-bold text-indigo-600">
                        {formatCurrency(total)}
                    </p>
                    {onCreateOrder && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onCreateOrder(template);
                            }}
                            className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-colors"
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
        </motion.div>
    );
}
