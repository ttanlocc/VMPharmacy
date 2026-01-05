import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    noHover?: boolean;
    hoverScale?: boolean;
}

const GlassCard = ({ children, className, noHover = false, hoverScale = false, ...props }: GlassCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={hoverScale ? { scale: 1.02 } : undefined}
            className={cn(
                "glass-card rounded-[2rem] p-6 text-slate-800 relative overflow-hidden",
                !noHover && "hover:-translate-y-1 hover:shadow-sky-200/50",
                className
            )}
            {...props}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 pointer-events-none" />
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
};

export default GlassCard;
