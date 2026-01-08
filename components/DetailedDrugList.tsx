import React from 'react';
import { Pill, Image as ImageIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface DrugItem {
    name: string;
    unit: string;
    quantity: number;
    price?: number;
    image_url?: string | null;
}

interface DetailedDrugListProps {
    items: DrugItem[];
    className?: string;
}

export default function DetailedDrugList({ items, className = "" }: DetailedDrugListProps) {
    return (
        <div className={`space-y-2 py-2 ${className}`}>
            {items.map((item, idx) => (
                <div
                    key={idx}
                    className="flex items-center gap-3 p-2 bg-slate-50/50 rounded-xl border border-slate-100/50"
                >
                    {/* Thumbnail */}
                    <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden shadow-sm">
                        {item.image_url ? (
                            <img
                                src={item.image_url}
                                className="h-full w-full object-cover"
                                alt={item.name}
                            />
                        ) : (
                            <Pill size={16} className="text-slate-300" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800">
                            {item.name}
                        </p>
                        <p className="text-[10px] text-slate-600 font-bold">
                            {item.quantity} {item.unit}
                            {item.price !== undefined && (
                                <span className="ml-1 text-slate-400">
                                    • {formatCurrency(item.price)}
                                </span>
                            )}
                        </p>
                    </div>

                    {/* Item Total */}
                    {item.price !== undefined && (
                        <div className="text-right shrink-0">
                            <p className="text-[10px] font-bold text-slate-900">
                                {formatCurrency(item.price * item.quantity)}
                            </p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
