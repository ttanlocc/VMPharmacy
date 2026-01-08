import { Drug } from '@/hooks/useDrugs';
import { formatCurrency } from '@/lib/utils';
import { Pill } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DrugItemProps {
    drug: Drug;
    quantity?: number;
    onClick?: () => void;
}

export function DrugItem({ drug, quantity = 0, onClick }: DrugItemProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 p-2 bg-white rounded-lg border transition-all cursor-pointer relative",
                quantity > 0
                    ? "border-primary/50 shadow-sm ring-1 ring-primary/20 bg-blue-50/30"
                    : "border-gray-100 hover:border-blue-200 active:bg-gray-50"
            )}
        >
            {/* Image: 48x48 */}
            <div className="w-12 h-12 bg-slate-50 flex items-center justify-center rounded-md overflow-hidden flex-shrink-0 relative">
                {drug.image_url ? (
                    <img
                        src={drug.image_url}
                        alt={drug.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <Pill size={24} className="text-slate-300" />
                )}

                {/* Quantity Badge on Image */}
                {quantity > 0 && (
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center backdrop-blur-[1px]">
                        <div className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shadow-lg transform scale-110">
                            {quantity}
                        </div>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className={cn("font-medium truncate", quantity > 0 ? "text-primary" : "text-gray-900")}>
                    {drug.name}
                </p>
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
