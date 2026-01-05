'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTemplates } from '@/hooks/useTemplates';
import { Plus, ClipboardList, ChevronRight, X, Trash2, Pill } from 'lucide-react';
import Container from '@/components/Container';
import SwipeableItem from '@/components/SwipeableItem';
import LoadingSpinner from '@/components/LoadingSpinner';
import ConfirmDialog from '@/components/ConfirmDialog';
import DrugPicker from '@/components/DrugPicker';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function TemplatesPage() {
    const { templates, loading, addTemplate, deleteTemplate } = useTemplates();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [selectedItems, setSelectedItems] = useState<any[]>([]);

    const resetForm = () => {
        setName('');
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
            await addTemplate(name, selectedItems);
            toast.success('Tạo đơn mẫu thành công');
            setIsModalOpen(false);
            resetForm();
        } catch (error: any) {
            toast.error(error.message || 'Tạo đơn mẫu thất bại');
            console.error(error);
        }
    };

    return (
        <Container className="bg-slate-50 min-h-screen">
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Đơn mẫu</h1>
                        <p className="text-slate-500 text-sm font-medium">Chọn nhanh đơn để xuất bán</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg active:scale-95 transition-transform"
                    >
                        <Plus size={24} />
                    </button>
                </div>

                {/* List */}
                {loading ? (
                    <LoadingSpinner label="Đang tải danh sách đơn mẫu..." className="mt-20" />
                ) : (
                    <div className="space-y-4">
                        {templates.length > 0 ? (
                            templates.map(template => {
                                const total = template.items?.reduce((sum, item) => sum + (item.drugs?.unit_price * item.quantity), 0) || 0;

                                return (
                                    <SwipeableItem
                                        key={template.id}
                                        onDelete={() => setIsDeleting(template.id)}
                                        className="rounded-3xl"
                                    >
                                        <Link
                                            href={`/checkout?templateId=${template.id}`}
                                            className="block p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:border-primary transition-colors active:scale-[0.99]"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="p-2.5 bg-sky-50 text-primary rounded-2xl">
                                                    <ClipboardList size={24} />
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-widest bg-slate-50 px-2 py-1 rounded-lg">
                                                        {template.items?.length || 0} loại thuốc
                                                    </span>
                                                </div>
                                            </div>

                                            <h3 className="text-lg font-extrabold text-slate-900 mb-1">{template.name}</h3>

                                            <div className="flex justify-between items-end">
                                                <div className="flex -space-x-2">
                                                    {template.items?.slice(0, 3).map((item, i) => (
                                                        <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 overflow-hidden">
                                                            {item.drugs?.image_url ? (
                                                                <img src={item.drugs.image_url} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center bg-slate-100">
                                                                    <Pill size={12} className="text-slate-300" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {(template.items?.length || 0) > 3 && (
                                                        <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                            +{(template.items?.length || 0) - 3}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Ước tính</p>
                                                    <p className="text-lg font-black text-primary leading-tight">
                                                        {formatCurrency(total)}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    </SwipeableItem>
                                )
                            })
                        ) : (
                            <div className="text-center py-20 text-slate-400 font-medium bg-white rounded-3xl border border-dashed border-slate-200">
                                Chưa có đơn mẫu nào.<br />Nhấn vào dấu (+) để tạo đơn đầu tiên.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
                        <div className="p-6 border-b border-slate-50 flex justify-between items-center shrink-0">
                            <h3 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Tạo đơn mẫu mới</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
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
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-lg font-bold"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-bold text-slate-700">Danh sách thuốc</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsPickerOpen(true)}
                                        className="text-xs font-bold text-primary flex items-center gap-1 bg-sky-50 px-3 py-1.5 rounded-xl hover:bg-sky-100 transition-colors"
                                    >
                                        <Plus size={14} /> Thêm thuốc
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {selectedItems.map((item, index) => (
                                        <div key={index} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-slate-900">{item.name}</h4>
                                                <button onClick={() => handleRemoveItem(index)} className="text-red-400 hover:text-red-600 p-1">
                                                    <X size={18} />
                                                </button>
                                            </div>
                                            <div className="flex gap-4 items-center">
                                                <div className="flex-1">
                                                    <div className="flex items-center bg-white rounded-xl border border-slate-200 overflow-hidden w-fit">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateItem(index, { quantity: Math.max(1, item.quantity - 1) })}
                                                            className="px-3 py-2 hover:bg-slate-50 text-slate-600"
                                                        >-</button>
                                                        <span className="px-4 font-bold text-sm min-w-[3rem] text-center">{item.quantity} {item.unit}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateItem(index, { quantity: item.quantity + 1 })}
                                                            className="px-3 py-2 hover:bg-slate-50 text-slate-600"
                                                        >+</button>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-sm font-black text-primary">{formatCurrency(item.price * item.quantity)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {selectedItems.length === 0 && (
                                        <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-sm">
                                            Chưa chọn thuốc nào
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 shrink-0">
                            <button
                                onClick={handleSubmit}
                                className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-sky-100 hover:bg-sky-600 active:scale-[0.98] transition-all"
                            >
                                Lưu đơn mẫu
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
