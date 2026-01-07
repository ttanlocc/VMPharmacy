import { ClipboardList, Pill, MoreVertical } from 'lucide-react';
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
}

export default function TemplateListItem({ template, index, onClick, onContextMenu, onLongPress, onMoreClick }: TemplateListItemProps) {
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
            className="cursor-pointer group relative h-full"
        >
            <GlassCard className="h-full !p-0 overflow-hidden flex flex-col hover:border-indigo-300 transition-colors">
                {/* Image Section (Top Half) */}
                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                    {template.image_url ? (
                        <img
                            src={template.image_url}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            alt={template.name}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-indigo-50/50">
                            <ClipboardList className="text-indigo-200" size={48} />
                        </div>
                    )}
                    <div
                        className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-slate-600 shadow-sm border border-slate-100 flex items-center gap-1"
                        aria-label={`${template.items?.length || 0} loại thuốc`}
                    >
                        <Pill size={12} className="text-indigo-500" />
                        {(template.items?.length || 0)}
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-4 flex flex-col flex-1">
                    <div className="flex-1">
                        <div className="flex justify-between items-start gap-2">
                            <h3 className="font-bold text-lg text-slate-800 line-clamp-2 mb-1 group-hover:text-indigo-700 transition-colors">
                                {template.name}
                            </h3>
                            {/* More Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onMoreClick) onMoreClick(template);
                                }}
                                className="p-1 -mr-1 text-slate-300 hover:text-slate-500 rounded-full hover:bg-slate-100 transition-colors"
                            >
                                <MoreVertical size={18} />
                            </button>
                        </div>
                        {template.total_price !== null && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wider mb-2">
                                Giá thủ công
                            </span>
                        )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-end">
                        <div className="flex -space-x-2">
                            {template.items?.slice(0, 3).map((item: any, i: number) => (
                                <div key={i} className="h-6 w-6 rounded-full border-2 border-white bg-slate-100 overflow-hidden">
                                    {item.drugs?.image_url ? (
                                        <img src={item.drugs.image_url} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center">
                                            <Pill size={10} className="text-slate-300" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <p className="text-lg font-black text-indigo-600">
                            {formatCurrency(total)}
                        </p>
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
}
