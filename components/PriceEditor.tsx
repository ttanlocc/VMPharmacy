import { Minus, Plus } from 'lucide-react';

interface PriceEditorProps {
    value: number;
    onChange: (value: number) => void;
    label?: string;
    min?: number;
    step?: number;
    format?: boolean;
}

export default function PriceEditor({
    value,
    onChange,
    label,
    min = 0,
    step = 1,
    format = false
}: PriceEditorProps) {
    const handleDecrement = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (value > min) onChange(value - step);
    };

    const handleIncrement = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(value + step);
    };

    return (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {label && <span className="text-xs text-slate-500 mr-1">{label}</span>}

            <button
                onClick={handleDecrement}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 active:bg-slate-200"
            >
                <Minus size={16} />
            </button>

            <div className="min-w-[3rem] text-center font-semibold text-slate-900">
                {format ? new Intl.NumberFormat('vi-VN').format(value) : value}
            </div>

            <button
                onClick={handleIncrement}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-sky-100 text-sky-600 active:bg-sky-200"
            >
                <Plus size={16} />
            </button>
        </div>
    );
}
