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

    const [showMenu, setShowMenu] = useState(false);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const isDragging = useRef(false);

    const handleTouchStart = () => {
        isDragging.current = false;
        longPressTimer.current = setTimeout(() => {
            if (!isDragging.current) {
                setShowMenu(true);
                // Trigger haptic feedback
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(50);
                }
            }
        }, 500); // 500ms for long press
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
        }
    };

    const handleTouchMove = () => {
        isDragging.current = true;
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
        }
    };

    return (
        <div
            className={cn("relative overflow-hidden group touch-pan-y select-none", className)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
            onMouseDown={() => {
                // For desktop testing
                longPressTimer.current = setTimeout(() => setShowMenu(true), 500);
            }}
            onMouseUp={() => {
                if (longPressTimer.current) clearTimeout(longPressTimer.current);
            }}
            onMouseLeave={() => {
                if (longPressTimer.current) clearTimeout(longPressTimer.current);
            }}
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

                {/* Long Press Menu Overlay */}
                <AnimatePresence>
                    {showMenu && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center gap-4"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(false);
                            }}
                        >
                            <motion.button
                                initial={{ scale: 0.8, y: 10 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.8, y: 10 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onEdit) onEdit();
                                    setShowMenu(false);
                                }}
                                className="flex flex-col items-center gap-1 text-white p-2 text-center"
                            >
                                <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center shadow-lg shadow-sky-500/40 mb-1">
                                    <Edit2 size={24} />
                                </div>
                                <span className="text-xs font-bold">Sửa</span>
                            </motion.button>

                            <motion.button
                                initial={{ scale: 0.8, y: 10 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.8, y: 10 }}
                                transition={{ delay: 0.1 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onDelete) onDelete();
                                    setShowMenu(false);
                                }}
                                className="flex flex-col items-center gap-1 text-white p-2 text-center"
                            >
                                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/40 mb-1">
                                    <Trash2 size={24} />
                                </div>
                                <span className="text-xs font-bold">Xóa</span>
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
