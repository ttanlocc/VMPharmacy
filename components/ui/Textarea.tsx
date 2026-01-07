import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> { }

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                ref={ref}
                className={cn(
                    "w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors",
                    "text-gray-900 placeholder:text-gray-500", // DARKER
                    "focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none",
                    "resize-none",
                    "disabled:bg-gray-100 disabled:text-gray-500",
                    className
                )}
                {...props}
            />
        );
    }
);

Textarea.displayName = 'Textarea';
