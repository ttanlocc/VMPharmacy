'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
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
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80]"
                    />

                    {/* Content - Bottom Sheet (Mobile) / Modal (Desktop) */}
                    <div className="fixed inset-0 z-[90] pointer-events-none flex items-end sm:items-center justify-center sm:p-4">
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl pointer-events-auto overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <h3 className="font-bold text-lg text-slate-800 line-clamp-1">{title}</h3>
                                <button
                                    onClick={onClose}
                                    className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="overflow-y-auto">
                                {/* Info Section */}
                                <div className="p-4 sm:p-5 space-y-3">
                                    {info.map((item, index) => (
                                        <div key={index} className="flex justify-between items-start gap-4">
                                            <span className="text-sm font-medium text-slate-500 shrink-0">{item.label}</span>
                                            <span className="text-sm font-bold text-slate-900 text-right break-words">{item.value}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Actions Section */}
                                <div className="p-4 sm:p-5 pt-0 grid grid-cols-1 gap-2">
                                    {actions.map((action, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                action.onClick();
                                                onClose();
                                            }}
                                            className={`
                                                w-full flex items-center gap-3 p-4 rounded-xl font-bold text-sm transition-all active:scale-[0.98]
                                                ${action.variant === 'danger'
                                                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                                                }
                                            `}
                                        >
                                            <span className="shrink-0">{action.icon}</span>
                                            {action.label}
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
