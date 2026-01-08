'use client';

import { useState } from 'react';
import { useDrugs, Drug } from '@/hooks/useDrugs';
import { useDrugGroups } from '@/hooks/useDrugGroups';
import { DrugItem } from './DrugItem';
import { Input } from './ui/Input';
import LoadingSpinner from './LoadingSpinner';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';



interface DrugPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (drug: Drug) => void;
}

export default function DrugPicker({ isOpen, onClose, onSelect }: DrugPickerProps) {
    const { drugs, loading } = useDrugs();
    const { groups } = useDrugGroups();
    const [search, setSearch] = useState('');
    const [selectedGroup, setSelectedGroup] = useState<string>('all');

    const filteredDrugs = drugs.filter(d => {
        const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase());
        const matchesGroup = selectedGroup === 'all' || d.group_id === selectedGroup;
        return matchesSearch && matchesGroup;
    });

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="w-full max-w-lg lg:max-w-5xl bg-white rounded-t-3xl sm:rounded-3xl h-[85vh] sm:h-[80vh] flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                        <h3 className="text-xl font-bold text-slate-900">Chọn thuốc</h3>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="px-6 py-4 shrink-0 space-y-3">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <Input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Tìm tên thuốc..."
                                className="pl-12"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                            <button
                                onClick={() => setSelectedGroup('all')}
                                className={cn(
                                    "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                                    selectedGroup === 'all'
                                        ? "bg-primary text-white"
                                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                                )}
                            >
                                Tất cả
                            </button>
                            {groups.map(group => (
                                <button
                                    key={group.id}
                                    onClick={() => setSelectedGroup(group.id)}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                                        selectedGroup === group.id
                                            ? "bg-primary text-white"
                                            : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                                    )}
                                >
                                    {group.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="flex-1 overflow-y-auto px-6 pb-6">
                        {loading ? (
                            <LoadingSpinner className="mt-20" label="Đang tải danh mục thuốc..." />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {filteredDrugs.length > 0 ? (
                                    filteredDrugs.map(drug => (
                                        <DrugItem
                                            key={drug.id}
                                            drug={drug}
                                            onClick={() => {
                                                onSelect(drug);
                                            }}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-20 text-slate-400">
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
