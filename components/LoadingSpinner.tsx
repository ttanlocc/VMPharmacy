'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
    className?: string;
    size?: number;
    label?: string;
}

export default function LoadingSpinner({
    className,
    size = 24,
    label = 'Đang tải...'
}: LoadingSpinnerProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center gap-2 p-4", className)}>
            <Loader2 className="animate-spin text-primary" size={size} />
            {label && <span className="text-sm text-slate-500 font-medium">{label}</span>}
        </div>
    );
}
