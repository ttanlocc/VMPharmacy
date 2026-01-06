/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTemplates } from '@/hooks/useTemplates';
import { Plus, ClipboardList, X, Pill } from 'lucide-react';
import Container from '@/components/Container';
import SwipeableItem from '@/components/SwipeableItem';
import LoadingSpinner from '@/components/LoadingSpinner';
import ConfirmDialog from '@/components/ConfirmDialog';
import DrugPicker from '@/components/DrugPicker';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';

export default function TemplatesPage() {
    const { templates, loading, addTemplate, deleteTemplate } = useTemplates();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [manualPrice, setManualPrice] = useState<number | undefined>(undefined);
    const [imageUrl, setImageUrl] = useState('');
    const [selectedItems, setSelectedItems] = useState<any[]>([]);

    const resetForm = () => {
        setName('');
        setManualPrice(undefined);
        setImageUrl('');
        setSelectedItems([]);
    };

    const handleAddDrug = (drug: any) => {
        setSelectedItems([...selectedItems, {
            drug_id: drug.id,
            name: drug.name,
            unit: drug.unit,
            price: drug.unit_price,
            quantity: 1,
            note: ''
        }]);
    };

    const handleRemoveItem = (index: number) => {
        setSelectedItems(selectedItems.filter((_, i) => i !== index));
    };

    const handleUpdateItem = (index: number, updates: any) => {
        setSelectedItems(selectedItems.map((item, i) => i === index ? { ...item, ...updates } : item));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedItems.length === 0) {
            toast.error('Vui lòng chọn ít nhất một loại thuốc');
            return;
        }

        try {
            await addTemplate(name, selectedItems, manualPrice, imageUrl);
            toast.success('Tạo đơn mẫu thành công');
            setIsModalOpen(false);
            resetForm();
        } catch (error: any) {
            toast.error(error.message || 'Tạo đơn mẫu thất bại');
            console.error(error);
        }
    };

    return (
        <Container>
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Đơn mẫu</h1>
                        <p className="text-slate-500 text-sm font-medium">Chọn nhanh đơn để xuất bán</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsModalOpen(true)}
                        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-200"
                    >
                        <Plus size={24} />
                    </motion.button>
                </div>

                {/* List */}
                {loading ? (
                    <LoadingSpinner label="Đang tải danh sách đơn mẫu..." className="mt-20" />
                ) : (
                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={{
                            hidden: { opacity: 0 },
                            show: {
                                opacity: 1,
                                transition: { staggerChildren: 0.05 }
                            }
                        }}
                        className="space-y-4"
                    >
                        {templates.length > 0 ? (
                            templates.map(template => {
                                const total = template.items?.reduce((sum, item) => sum + (item.drugs?.unit_price * item.quantity), 0) || 0;

                                return (
                                    <motion.div
                                        key={template.id}
                                        variants={{
                                            hidden: { opacity: 0, y: 20 },
                                            show: { opacity: 1, y: 0 }
                                        }}
                                    >
                                        <SwipeableItem
                                            onDelete={() => setIsDeleting(template.id)}
                                            className="rounded-[2rem]"
                                        >
                                            <Link href={`/checkout?templateId=${template.id}`}>
                                                <GlassCard className="!p-5 border-none shadow-md !bg-white/70" noHover>
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="p-3 bg-sky-50 text-sky-500 rounded-2xl">
                                                            <ClipboardList size={22} />
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest bg-slate-100/50 px-2 py-1 rounded-lg">
                                                                {template.items?.length || 0} loại
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <h3 className="text-lg font-extrabold text-slate-800 mb-3">{template.name}</h3>

                                                    <div className="flex justify-between items-end">
                                                        <div className="flex -space-x-2">
                                                            {template.items?.slice(0, 3).map((item, i) => (
                                                                <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 overflow-hidden shadow-sm">
                                                                    {item.drugs?.image_url ? (
                                                                        <img src={item.drugs.image_url} className="h-full w-full object-cover" />
                                                                    ) : (
                                                                        <div className="h-full w-full flex items-center justify-center bg-slate-50">
                                                                            <Pill size={12} className="text-slate-300" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                            {(template.items?.length || 0) > 3 && (
                                                                <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm">
                                                                    +{(template.items?.length || 0) - 3}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Ước tính</p>
                                                            <p className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600 leading-tight">
                                                                {formatCurrency(total)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </GlassCard>
                                            </Link>
                                        </SwipeableItem>
                                    </motion.div>
                                )
                            })
                        ) : (
                            <GlassCard className="text-center py-20 text-slate-400 font-medium !bg-white/40 border-dashed border-slate-300/50">
                                Chưa có đơn mẫu nào.<br />Nhấn vào dấu (+) để tạo đơn đầu tiên.
                            </GlassCard>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Create Modal - Keeping this relatively standard but with backdrop blur */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/20 backdrop-blur-md"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-t-[2.5rem] sm:rounded-[2.5rem] h-[90vh] flex flex-col overflow-hidden relative z-10 shadow-2xl"
                        >
                            <div className="p-6 border-b border-slate-100/50 flex justify-between items-center shrink-0">
                                <h3 className="text-xl font-extrabold text-slate-800 uppercase tracking-tight">Tạo đơn mẫu mới</h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Tên đơn mẫu</label>
                                    <input
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="VD: Đơn đau dạ dày"
                                        className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-300 transition-all text-lg font-bold placeholder:font-medium"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Giá tiền (Tùy chọn)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={manualPrice || ''}
                                                onChange={(e) => setManualPrice(e.target.value ? Number(e.target.value) : undefined)}
                                                placeholder="Để trống = Tự cộng"
                                                className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-300 transition-all font-bold placeholder:font-medium"
                                            />
                                            {selectedItems.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const sum = selectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                                                        setManualPrice(sum);
                                                    }}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-sky-600 bg-sky-50 px-2 py-1 rounded-lg hover:bg-sky-100"
                                                >
                                                    Auto
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Ảnh đại diện (URL)</label>
                                        <input
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                            placeholder="https://..."
                                            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-300 transition-all font-medium placeholder:font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-bold text-slate-700">Danh sách thuốc</label>
                                        <button
                                            type="button"
                                            onClick={() => setIsPickerOpen(true)}
                                            className="text-xs font-bold text-sky-600 flex items-center gap-1 bg-sky-50 px-3 py-1.5 rounded-xl hover:bg-sky-100 transition-colors"
                                        >
                                            <Plus size={14} /> Thêm thuốc
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {selectedItems.map((item, index) => (
                                            <div key={index} className="p-4 bg-white/60 rounded-2xl border border-slate-100 shadow-sm">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-slate-900">{item.name}</h4>
                                                    <button onClick={() => handleRemoveItem(index)} className="text-red-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-lg transition-colors">
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                                <div className="flex gap-4 items-center">
                                                    <div className="flex-1">
                                                        <div className="flex items-center bg-white rounded-xl border border-slate-200 overflow-hidden w-fit shadow-sm">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleUpdateItem(index, { quantity: Math.max(1, item.quantity - 1) })}
                                                                className="px-3 py-2 hover:bg-slate-50 text-slate-600 active:bg-slate-100"
                                                            >-</button>
                                                            <span className="px-4 font-bold text-sm min-w-[3rem] text-center">{item.quantity} {item.unit}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleUpdateItem(index, { quantity: item.quantity + 1 })}
                                                                className="px-3 py-2 hover:bg-slate-50 text-slate-600 active:bg-slate-100"
                                                            >+</button>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-sm font-black text-sky-600">{formatCurrency(item.price * item.quantity)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {selectedItems.length === 0 && (
                                            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm">
                                                Chưa chọn thuốc nào
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-100 shrink-0 bg-white/50 backdrop-blur-sm">
                                <button
                                    onClick={handleSubmit}
                                    className="w-full py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-sky-200 hover:shadow-sky-300 active:scale-[0.98] transition-all"
                                >
                                    Lưu đơn mẫu
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Drug Picker */}
            <DrugPicker
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onSelect={handleAddDrug}
            />

            {/* Delete Confirm */}
            <ConfirmDialog
                isOpen={!!isDeleting}
                onClose={() => setIsDeleting(null)}
                onConfirm={() => isDeleting && deleteTemplate(isDeleting)}
                title="Xóa đơn mẫu?"
                description="Bạn có chắc muốn xóa đơn mẫu này không?"
            />
        </Container>
    );
}
