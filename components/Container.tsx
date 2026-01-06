'use client';

import { cn } from '@/lib/utils';

interface ContainerProps {
    children: React.ReactNode;
    className?: string;
    as?: React.ElementType;
}

export default function Container({
    children,
    className,
    as: Component = 'div'
}: ContainerProps) {
    return (
        <Component className={cn("w-full max-w-7xl mx-auto px-4 pb-20 pt-4", className)}>
            {children}
        </Component>
    );
}
