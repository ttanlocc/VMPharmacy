import { Drug } from '@/hooks/useDrugs';
import { formatCurrency } from '@/lib/utils';
import { Pill } from 'lucide-react';

interface DrugItemProps {
    drug: Drug;
    onClick?: () => void;
}

export function DrugItem({ drug, onClick }: DrugItemProps) {
    return (
        <div
            onClick={onClick}
            className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-100 active:bg-gray-50 cursor-pointer transition-colors"
        >
            {/* Image: 48x48 instead of 80x80 */}
            <div className="w-12 h-12 bg-slate-50 flex items-center justify-center rounded-md overflow-hidden flex-shrink-0">
                {drug.image_url ? (
                    <img
                        src={drug.image_url}
                        alt={drug.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <Pill size={24} className="text-slate-300" />
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{drug.name}</p>
                <p className="text-sm text-gray-600 font-bold">{drug.unit}</p>
            </div>

            {/* Price */}
            <div className="text-right flex-shrink-0">
                <p className="font-semibold text-primary">
                    {formatCurrency(drug.unit_price)}
                </p>
            </div>
        </div>
    );
}
