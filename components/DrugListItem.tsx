import { ActionMenu } from '@/components/ActionMenu';
import { useLongPress } from '@/components/useLongPress';
import SwipeableItem from '@/components/SwipeableItem';
import { Drug } from '@/hooks/useDrugs';
import { formatCurrency } from '@/lib/utils';
import { MoreVertical, Trash2, Edit, Copy, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';

interface DrugListItemProps {
    drug: Drug;
    onEdit: (drug: Drug) => void;
    onClick: (drug: Drug) => void;
    onContextMenu: (e: React.MouseEvent, drug: Drug) => void;
    onLongPress: (drug: Drug) => void;
    onMoreClick?: (drug: Drug) => void;
}

export default function DrugListItem({ drug, onEdit, onClick, onContextMenu, onLongPress, onMoreClick }: DrugListItemProps) {
    const longPressHandlers = useLongPress(() => {
        onLongPress(drug);
    });

    return (
        <SwipeableItem
            className="rounded-2xl"
            onEdit={() => onEdit(drug)}
        >
            <div
                className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl relative cursor-pointer"
                onClick={() => onClick(drug)}
                onContextMenu={(e) => onContextMenu(e, drug)}
                {...longPressHandlers}
            >
                <div className="relative h-16 w-16 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                    {drug.image_url ? (
                        <img src={drug.image_url} alt={drug.name} className="h-full w-full object-cover" />
                    ) : (
                        <ImageIcon size={24} className="text-slate-300" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 truncate">{drug.name}</h3>
                    {drug.active_ingredient && (
                        <p className="text-xs text-slate-600 truncate mb-1 font-medium">
                            {drug.active_ingredient}
                        </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-slate-600 px-2 py-0.5 bg-slate-100 rounded-full uppercase tracking-wider">
                            {drug.unit}
                        </span>
                        <span className="text-sm font-bold text-primary">
                            {formatCurrency(drug.unit_price)} đ
                        </span>
                    </div>
                </div>

                {/* More Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onMoreClick) onMoreClick(drug);
                    }}
                    className="p-2 text-slate-300 hover:text-slate-500 rounded-full hover:bg-slate-50 transition-colors"
                >
                    <MoreVertical size={20} />
                </button>
            </div>
        </SwipeableItem>
    );
}
