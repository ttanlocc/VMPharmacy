'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export interface ActionMenuItem {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'danger';
}

interface ActionMenuProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    info: { label: string; value: string | React.ReactNode }[];
    actions: ActionMenuItem[];
}

export function ActionMenu({ isOpen, onClose, title, info, actions }: ActionMenuProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[80]"
                    />

                    {/* Menu Content */}
                    <div className="fixed inset-0 z-[90] pointer-events-none flex items-center justify-center p-4 sm:items-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", duration: 0.4, bounce: 0.25 }}
                            className="w-full max-w-[260px] pointer-events-auto flex flex-col gap-3"
                        >
                            {/* Info Section (Optional Bubble) */}
                            {(title || (info && info.length > 0)) && (
                                <div className="bg-zinc-800/90 backdrop-blur-xl rounded-xl overflow-hidden p-4 shadow-2xl border border-white/10">
                                    {title && (
                                        <h3 className="font-semibold text-white/90 text-sm mb-3 text-center border-b border-white/10 pb-2">{title}</h3>
                                    )}
                                    <div className="space-y-2">
                                        {info.map((item, i) => (
                                            <div key={i} className="flex justify-between items-center text-xs">
                                                <span className="text-zinc-400">{item.label}</span>
                                                <span className="text-white font-medium max-w-[60%] truncate">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions List */}
                            <div className="bg-zinc-800/90 backdrop-blur-xl rounded-xl overflow-hidden shadow-2xl border border-white/10">
                                <div className="divide-y divide-white/10">
                                    {actions.map((action, index) => (
                                        <button
                                            key={index}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                action.onClick();
                                                onClose();
                                            }}
                                            className={`
                                                w-full flex items-center justify-between p-3.5 px-4 text-[13px] font-medium transition-colors
                                                hover:bg-white/10 active:bg-white/20
                                                ${action.variant === 'danger' ? 'text-red-400' : 'text-white'}
                                            `}
                                        >
                                            <span>{action.label}</span>
                                            <span className={action.variant === 'danger' ? 'text-red-400' : 'text-zinc-400'}>
                                                {action.icon}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
