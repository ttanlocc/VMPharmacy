'use client';

import Image from 'next/image';
import { Database } from '@/types/database';
import { formatCurrency } from '@/lib/utils';
import { Pill } from 'lucide-react';

type Drug = Database['public']['Tables']['drugs']['Row'];

interface DrugCardProps {
    drug: Drug;
    onClick?: () => void;
    className?: string;
}

export default function DrugCard({ drug, onClick, className }: DrugCardProps) {
    return (
        <div
            onClick={onClick}
            className={`flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm active:scale-95 transition-transform cursor-pointer ${className}`}
        >
            <div className="relative aspect-square w-full bg-slate-50 flex items-center justify-center overflow-hidden">
                {drug.image_url ? (
                    <Image
                        src={drug.image_url}
                        alt={drug.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 33vw, 150px"
                    />
                ) : (
                    <Pill size={32} className="text-slate-300" />
                )}
            </div>
            <div className="p-3">
                <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{drug.name}</h4>
                <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] text-slate-500 font-medium px-2 py-0.5 bg-slate-100 rounded-full">
                        {drug.unit}
                    </span>
                    <span className="text-xs font-bold text-primary">
                        {formatCurrency(drug.unit_price)}
                    </span>
                </div>
            </div>
        </div>
    );
}
