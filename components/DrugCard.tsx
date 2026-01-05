import Image from 'next/image';
import { Plus } from 'lucide-react';

interface Drug {
    id: string;
    name: string;
    unit: string;
    unit_price: number;
    image_url: string | null;
}

interface DrugCardProps {
    drug: Drug;
    onSelect?: (drug: Drug) => void;
}

export default function DrugCard({ drug, onSelect }: DrugCardProps) {
    return (
        <div
            onClick={() => onSelect?.(drug)}
            className="flex flex-col bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden active:scale-95 transition-transform duration-100"
        >
            <div className="relative w-full aspect-square bg-slate-50">
                {drug.image_url ? (
                    <Image
                        src={drug.image_url}
                        alt={drug.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 33vw"
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-full text-slate-300">
                        <span className="text-4xl">💊</span>
                    </div>
                )}
                <button className="absolute bottom-2 right-2 bg-sky-500 text-white p-1.5 rounded-full shadow-lg">
                    <Plus size={16} strokeWidth={2.5} />
                </button>
            </div>

            <div className="p-3">
                <h3 className="font-semibold text-slate-900 leading-tight line-clamp-2 h-10 mb-1">
                    {drug.name}
                </h3>
                <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {drug.unit}
                    </span>
                    <span className="font-bold text-sky-600">
                        {new Intl.NumberFormat('vi-VN').format(drug.unit_price)}
                    </span>
                </div>
            </div>
        </div>
    );
}
