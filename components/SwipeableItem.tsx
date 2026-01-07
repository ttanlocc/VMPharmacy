'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, AnimatePresence } from 'framer-motion';
import { Trash2, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeableItemProps {
    children: React.ReactNode;
    onDelete?: () => void;
    onEdit?: () => void;
    className?: string;
    showHint?: boolean;
}

export default function SwipeableItem({
    children,
    onDelete,
    onEdit,
    className,
    showHint
}: SwipeableItemProps) {
    const x = useMotionValue(0);
    const controls = useAnimation();

    // Drag threshold for action
    const threshold = 70;

    // Opacity and scale transforms based on drag
    const deleteOpacity = useTransform(x, [-threshold, -20], [1, 0]);
    const editOpacity = useTransform(x, [20, threshold], [0, 1]);

    const deleteScale = useTransform(x, [-threshold, -20], [1, 0.5]);
    const editScale = useTransform(x, [20, threshold], [0.5, 1]);

    const handleDragEnd = async (_: any, info: any) => {
        const dragX = info.offset.x;

        if (dragX < -threshold) {
            if (onDelete) onDelete();
            controls.start({ x: 0 });
        } else if (dragX > threshold) {
            if (onEdit) onEdit();
            controls.start({ x: 0 });
        } else {
            controls.start({ x: 0 });
        }
    };

    const hasShownHintKey = "pharmacy_swipe_hint_shown";

    useEffect(() => {
        if (showHint) {
            const hasShown = localStorage.getItem(hasShownHintKey);
            if (!hasShown) {
                // Subtle shake animation
                controls.start({
                    x: [-4, 4, -4, 4, 0],
                    transition: { duration: 0.6, delay: 1, ease: 'easeInOut' }
                });
                localStorage.setItem(hasShownHintKey, 'true');
            }
        }
    }, [showHint, controls]);

    return (
        <div
            className={cn("relative overflow-hidden group touch-pan-y select-none", className)}
        >
            {/* Action Backgrounds */}
            <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
                <motion.div
                    style={{ opacity: editOpacity, scale: editScale }}
                    className="flex items-center gap-2 text-primary font-bold"
                >
                    <div className="p-2 bg-primary/10 rounded-full">
                        <Edit2 size={20} />
                    </div>
                    <span>Sửa</span>
                </motion.div>

                <motion.div
                    style={{ opacity: deleteOpacity, scale: deleteScale }}
                    className="flex items-center gap-2 text-danger font-bold"
                >
                    <span>Xóa</span>
                    <div className="p-2 bg-danger/10 rounded-full">
                        <Trash2 size={20} />
                    </div>
                </motion.div>
            </div>

            {/* Content */}
            <motion.div
                drag="x"
                dragConstraints={{ left: -100, right: 100 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                animate={controls}
                style={{ x }}
                className="relative z-10 bg-white"
            >
                {children}
            </motion.div>
        </div>
    );
}

