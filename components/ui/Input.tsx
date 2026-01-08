import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> { }

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={cn(
                    // Base
                    "w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors",
                    // Text - DARKER
                    "text-gray-900 placeholder:text-gray-600",
                    // Focus
                    "focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none",
                    // Disabled
                    "disabled:bg-gray-100 disabled:text-gray-500",
                    className
                )}
                {...props}
            />
        );
    }
);

Input.displayName = 'Input';
