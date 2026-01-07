/* eslint-disable @next/next/no-img-element */
import { Edit3, Pill, ClipboardList } from 'lucide-react';
import SwipeableItem from '@/components/SwipeableItem';
import { formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface CheckoutLineItemProps {
    item: any;
    index: number;
    onDelete: () => void;
    onEdit: () => void;
    onUpdateQuantity: (delta: number) => void;
    showHint?: boolean;
}

export default function CheckoutLineItem({ item, index, onDelete, onEdit, onUpdateQuantity, showHint }: CheckoutLineItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <SwipeableItem
            onDelete={onDelete}
            onEdit={onEdit}
            className="rounded-2xl"
            showHint={showHint}
        >
            <div
                className={`flex gap-3 p-3 border rounded-2xl relative overflow-hidden transition-all duration-200 ${item.type === 'template' ? 'bg-indigo-50/50 border-indigo-100' : 'bg-white border-slate-100'}`}
                onClick={() => item.type === 'template' && setIsExpanded(!isExpanded)}
            >
                {/* Image */}
                <div className="h-14 w-14 bg-white rounded-xl flex items-center justify-center shrink-0 overflow-hidden shadow-sm border border-slate-100 relative mt-0.5">
                    {item.image || item.image_url ? (
                        <img
                            src={item.image || item.image_url || ''}
                            className="h-full w-full object-cover"
                            alt={item.name}
                            loading="lazy"
                        />
                    ) : (
                        item.type === 'template' ? <ClipboardList size={28} className="text-indigo-400" /> : <Pill size={28} className="text-slate-300" />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                        <div className="flex justify-between items-start gap-2">
                            <h3 className={`font-bold text-base ${item.type === 'template' ? 'text-indigo-900' : 'text-slate-800'} truncate leading-tight`}>
                                {item.name}
                            </h3>
                            {item.type === 'template' && (
                                <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded">
                                    {item.items?.length || 0} món
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm font-bold text-primary flex items-center gap-1">
                                {formatCurrency(item.price)}
                            </p>
                            <span className="text-[10px] text-slate-500 font-medium">/ {item.type === 'template' ? 'đơn' : item.unit}</span>
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                                className="p-1 text-slate-400 hover:text-sky-500 transition-colors opacity-50 hover:opacity-100"
                            >
                                <Edit3 size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Template Expansion */}
                    <AnimatePresence>
                        {isExpanded && item.type === 'template' && item.items && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mt-2 overflow-hidden"
                            >
                                <div className="pl-2 border-l-2 border-indigo-200 py-1 space-y-1">
                                    {item.items.map((sub: any, i: number) => (
                                        <div key={i} className="flex justify-between text-xs text-slate-600">
                                            <span className="truncate mr-2">• {sub.name}</span>
                                            <span className="font-bold text-slate-500 shrink-0">x{sub.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-end justify-between shrink-0 pl-2">
                    <div
                        className="flex items-center bg-white rounded-lg border border-slate-200 px-0.5 py-0.5 shadow-sm"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => onUpdateQuantity(-1)}
                            className="w-7 h-7 flex items-center justify-center font-bold text-slate-400 hover:text-slate-600 transition-colors text-sm active:scale-90"
                        >-</button>
                        <span className="w-6 text-center font-black text-sm text-slate-900">{item.quantity}</span>
                        <button
                            onClick={() => onUpdateQuantity(1)}
                            className="w-7 h-7 flex items-center justify-center font-bold text-slate-400 hover:text-slate-600 transition-colors text-sm active:scale-90"
                        >+</button>
                    </div>
                    <span className="text-sm font-black text-slate-900 mt-2">{formatCurrency(item.price * item.quantity)}</span>
                </div>
            </div>
        </SwipeableItem>
    );
}
