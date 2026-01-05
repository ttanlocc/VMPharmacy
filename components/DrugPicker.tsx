'use client';

import { useState } from 'react';
import { useDrugs } from '@/hooks/useDrugs';
import DrugCard from './DrugCard';
import LoadingSpinner from './LoadingSpinner';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database } from '@/types/database';

type Drug = Database['public']['Tables']['drugs']['Row'];

interface DrugPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (drug: Drug) => void;
}

export default function DrugPicker({ isOpen, onClose, onSelect }: DrugPickerProps) {
    const { drugs, loading } = useDrugs();
    const [search, setSearch] = useState('');

    const filteredDrugs = drugs.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl h-[85vh] sm:h-[80vh] flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                        <h3 className="text-xl font-bold text-slate-900">Chọn thuốc</h3>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="px-6 py-4 shrink-0">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Tìm tên thuốc..."
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="flex-1 overflow-y-auto px-6 pb-6">
                        {loading ? (
                            <LoadingSpinner className="mt-20" label="Đang tải danh mục thuốc..." />
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {filteredDrugs.length > 0 ? (
                                    filteredDrugs.map(drug => (
                                        <DrugCard
                                            key={drug.id}
                                            drug={drug}
                                            onClick={() => {
                                                onSelect(drug);
                                                onClose();
                                            }}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-2 text-center py-20 text-slate-400">
                                        Không tìm thấy thuốc nào khớp với "{search}"
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
