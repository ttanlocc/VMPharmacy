/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTemplates } from '@/hooks/useTemplates';
import { useCheckout } from '@/app/context/CheckoutContext';
import { Plus, Search, ClipboardList, Trash2, Edit3, ShoppingBag, Pill, X, Image as ImageIcon, ChevronRight, Eye } from 'lucide-react';
import Container from '@/components/Container';
import GlassCard from '@/components/ui/GlassCard';
import DrugPicker from '@/components/DrugPicker';
import LoadingSpinner from '@/components/LoadingSpinner';
import ConfirmDialog from '@/components/ConfirmDialog';
import { formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { uploadImage } from '@/lib/upload';

export default function TemplatesPage() {
    const router = useRouter();
    const { templates, loading, addTemplate, updateTemplate, deleteTemplate } = useTemplates();
    const { addItem } = useCheckout();
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false); // For Create/Edit Modal
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
    const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null); // To track if we are editing

    // Form State
    const [name, setName] = useState('');
    const [selectedDrugs, setSelectedDrugs] = useState<any[]>([]);
    const [manualPrice, setManualPrice] = useState<number | undefined>(undefined);
    const [imageUrl, setImageUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase())
    );

    const resetForm = () => {
        setName('');
        setSelectedDrugs([]);
        setManualPrice(undefined);
        setImageUrl('');
        setEditingTemplateId(null);
    };

    const openCreateModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (template: any) => {
        setEditingTemplateId(template.id);
        setName(template.name);
        setSelectedDrugs(template.items.map((item: any) => ({
            drug_id: item.drug_id,
            name: item.drugs?.name,
            unit: item.drugs?.unit,
            price: item.drugs?.unit_price, // Use unit_price from drugs for calculation if custom_price not set
            quantity: item.quantity,
            image_url: item.drugs?.image_url,
            note: item.note
        })));
        setManualPrice(template.total_price !== null ? Number(template.total_price) : undefined);
        setImageUrl(template.image_url || '');
        setIsModalOpen(true);
        setIsDetailModalOpen(false); // Close detail modal if open
    };

    const handleSubmit = async () => {
        if (!name || selectedDrugs.length === 0) {
            toast.error('Vui lòng nhập tên và chọn ít nhất 1 thuốc');
            return;
        }

        const templateData = {
            name,
            items: selectedDrugs.map(d => ({
                drug_id: d.drug_id || d.id,
                quantity: d.quantity,
                note: d.note
            })),
            total_price: manualPrice,
            image_url: imageUrl
        };

        try {
            if (editingTemplateId) {
                await updateTemplate(editingTemplateId, templateData);
                toast.success('Cập nhật đơn mẫu thành công');
            } else {
                await addTemplate(templateData.name, templateData.items, templateData.total_price, templateData.image_url);
                toast.success('Tạo đơn mẫu thành công');
            }
            setIsModalOpen(false);
            resetForm();
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra');
            console.error(error);
        }
    };

    const handleDelete = async () => {
        if (!isDeleting) return;
        try {
            await deleteTemplate(isDeleting);
            toast.success('Đã xóa đơn mẫu');
            setIsDeleting(null);
            setIsDetailModalOpen(false); // Close detail modal if open
        } catch (error: any) {
            toast.error('Xóa thất bại');
        }
    };

    const handleCreateOrder = (template: any) => {
        // Calculate price to show in checkout (either manual or sum)
        const templateTotal = template.total_price !== null
            ? Number(template.total_price)
            : (template.items?.reduce((sum: number, item: any) => sum + ((item.custom_price || item.drugs?.unit_price || 0) * item.quantity), 0) || 0);

        const templateItem = {
            name: template.name,
            unit: 'đơn',
            price: templateTotal,
            quantity: 1,
            image_url: template.image_url,
            note: '',
            type: 'template' as const,
            template_id: template.id,
            items: (template.items || []).map((item: any) => ({
                drug_id: item.drug_id,
                name: item.drugs?.name || '',
                unit: item.drugs?.unit || '',
                quantity: item.quantity
            }))
        };

        addItem(templateItem);
        router.push('/checkout');
        toast.success('Đã thêm "' + template.name + '" vào đơn hàng');
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await uploadImage(file, 'templates');
            setImageUrl(url);
            toast.success('Upload ảnh thành công');
        } catch (error: any) {
            toast.error('Upload thất bại: ' + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const openDetail = (template: any) => {
        setSelectedTemplate(template);
        setIsDetailModalOpen(true);
    };

    // Calculate sum of drugs for display/auto-calc
    const currentDrugsSum = selectedDrugs.reduce((sum, d) => sum + (d.price || d.unit_price || 0) * d.quantity, 0);

    return (
        <Container className="bg-slate-50 min-h-screen pb-24">
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Đơn mẫu</h1>
                        <p className="text-slate-500 text-sm font-medium">Tạo các combo thuốc bán nhanh</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex h-10 w-10 sm:h-auto sm:w-auto sm:px-6 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 active:scale-95 transition-transform font-bold"
                    >
                        <Plus size={24} className="sm:mr-2" />
                        <span className="hidden sm:inline">Tạo mới</span>
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm kiếm đơn mẫu..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                </div>

                {/* Grid List */}
                {loading ? (
                    <LoadingSpinner label="Đang tải danh sách..." className="mt-20" />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence>
                            {filteredTemplates.length > 0 ? (
                                filteredTemplates.map((template, idx) => {
                                    const total = template.total_price !== null
                                        ? Number(template.total_price)
                                        : (template.items?.reduce((sum, item) => sum + ((item.custom_price || item.drugs?.unit_price || 0) * item.quantity), 0) || 0);

                                    return (
                                        <motion.div
                                            key={template.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => openDetail(template)}
                                            className="cursor-pointer group"
                                        >
                                            <GlassCard className="h-full !p-0 overflow-hidden flex flex-col hover:border-indigo-300 transition-colors">
                                                {/* Image Section (Top Half) */}
                                                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                                                    {template.image_url ? (
                                                        <img
                                                            src={template.image_url}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                            alt={template.name}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-indigo-50/50">
                                                            <ClipboardList className="text-indigo-200" size={48} />
                                                        </div>
                                                    )}
                                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-slate-600 shadow-sm border border-slate-100 flex items-center gap-1">
                                                        <Pill size={12} className="text-indigo-500" />
                                                        {(template.items?.length || 0)}
                                                    </div>
                                                </div>

                                                {/* Content Section */}
                                                <div className="p-4 flex flex-col flex-1">
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-lg text-slate-800 line-clamp-2 mb-1 group-hover:text-indigo-700 transition-colors">
                                                            {template.name}
                                                        </h3>
                                                        {template.total_price !== null && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wider mb-2">
                                                                Giá thủ công
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-end">
                                                        <div className="flex -space-x-2">
                                                            {template.items?.slice(0, 3).map((item, i) => (
                                                                <div key={i} className="h-6 w-6 rounded-full border-2 border-white bg-slate-100 overflow-hidden">
                                                                    {item.drugs?.image_url ? (
                                                                        <img src={item.drugs.image_url} className="h-full w-full object-cover" />
                                                                    ) : (
                                                                        <div className="h-full w-full flex items-center justify-center">
                                                                            <Pill size={10} className="text-slate-300" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <p className="text-lg font-black text-indigo-600">
                                                            {formatCurrency(total)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </GlassCard>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <div className="col-span-full text-center py-20">
                                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ClipboardList className="text-slate-300" size={40} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">Chưa có đơn mẫu nào</h3>
                                    <p className="text-slate-500 mt-1">Bắt đầu bằng việc tạo combo thuốc đầu tiên</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xl font-extrabold text-slate-900">{editingTemplateId ? 'Chỉnh Sửa Đơn Mẫu' : 'Tạo Đơn Mẫu Mới'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6 flex-1">
                            {/* Image Upload */}
                            <div className="flex justify-center">
                                <div
                                    className="relative w-full aspect-video sm:w-64 sm:h-40 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 cursor-pointer overflow-hidden group transition-colors"
                                    onClick={() => document.getElementById('template-upload')?.click()}
                                >
                                    {imageUrl ? (
                                        <>
                                            <img src={imageUrl} className="w-full h-full object-cover" alt="Template preview" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="bg-white/20 backdrop-blur p-2 rounded-full">
                                                    <Edit3 className="text-white" />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full">
                                            {isUploading ? (
                                                <LoadingSpinner size={24} className="p-0" label="" />
                                            ) : (
                                                <>
                                                    <ImageIcon className="text-slate-300 mb-2" size={32} />
                                                    <span className="text-xs font-bold text-slate-400 uppercase">Tải ảnh lên</span>
                                                </>
                                            )}
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        id="template-upload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                </div>
                            </div>

                            {/* Name & Pricing */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Tên đơn mẫu</label>
                                    <input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="VD: Combo Cảm Cúm"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
                                        Giá bán (đ) <span className="text-slate-500 font-normal">- Tùy chọn</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={manualPrice === undefined ? '' : manualPrice}
                                            onChange={(e) => setManualPrice(e.target.value ? Number(e.target.value) : undefined)}
                                            placeholder={'Tổng gốc: ' + formatCurrency(currentDrugsSum)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-indigo-600"
                                        />
                                        <button
                                            onClick={() => setManualPrice(currentDrugsSum)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-indigo-100 text-indigo-600 px-2 py-1 rounded-lg hover:bg-indigo-200 transition-colors"
                                        >
                                            AUTO
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Drugs List */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-bold text-slate-700 ml-1">Danh sách thuốc</label>
                                    <button
                                        onClick={() => setIsPickerOpen(true)}
                                        className="text-xs font-bold text-indigo-600 flex items-center hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors"
                                    >
                                        <Plus size={14} className="mr-1" />
                                        Thêm thuốc
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {selectedDrugs.length > 0 ? (
                                        selectedDrugs.map((selected, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center shrink-0 border border-slate-100">
                                                    {selected.image_url ? (
                                                        <img src={selected.image_url} className="h-full w-full object-cover rounded-lg" alt={selected.name} />
                                                    ) : (
                                                        <Pill className="text-slate-300" size={16} />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-slate-800 text-sm truncate">{selected.name}</p>
                                                    <p className="text-xs text-slate-500">{formatCurrency(selected.price || selected.unit_price)} / {selected.unit}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="number"
                                                        value={selected.quantity}
                                                        onChange={(e) => {
                                                            const newQty = parseInt(e.target.value) || 1;
                                                            const updated = [...selectedDrugs];
                                                            updated[idx].quantity = newQty;
                                                            setSelectedDrugs(updated);
                                                        }}
                                                        className="w-16 px-2 py-1 text-center bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-indigo-500"
                                                    />
                                                    <button
                                                        onClick={() => setSelectedDrugs(selectedDrugs.filter((_, i) => i !== idx))}
                                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div
                                            onClick={() => setIsPickerOpen(true)}
                                            className="py-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
                                        >
                                            <ShoppingBag size={32} className="mb-2 opacity-50" />
                                            <span className="text-sm font-medium">Chưa có thuốc nào</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                            <button
                                onClick={handleSubmit}
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all"
                            >
                                {editingTemplateId ? 'Cập Nhật Đơn Mẫu' : 'Lưu Đơn Mẫu'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Template Detail Modal */}
            {isDetailModalOpen && selectedTemplate && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <div className="w-full max-w-lg bg-white rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        {/* Image Header */}
                        <div className="relative aspect-video bg-slate-100">
                            {selectedTemplate.image_url ? (
                                <img src={selectedTemplate.image_url} className="w-full h-full object-cover" alt={selectedTemplate.name} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-indigo-50">
                                    <ClipboardList size={64} className="text-indigo-200" />
                                </div>
                            )}
                            <button
                                onClick={() => setIsDetailModalOpen(false)}
                                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm transition-colors"
                            >
                                <X size={20} />
                            </button>
                            <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                                <h2 className="text-2xl font-black text-white line-clamp-2">{selectedTemplate.name}</h2>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Giá bán</p>
                                    <p className="text-3xl font-black text-indigo-600">
                                        {formatCurrency(
                                            selectedTemplate.total_price !== null
                                                ? Number(selectedTemplate.total_price)
                                                : (selectedTemplate.items?.reduce((sum: any, item: any) => sum + ((item.custom_price || item.drugs?.unit_price || 0) * item.quantity), 0) || 0)
                                        )}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Số lượng thuốc</p>
                                    <p className="text-xl font-bold text-slate-800">{selectedTemplate.items?.length || 0} loại</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                    <ShoppingBag size={18} />
                                    Chi tiết thành phần
                                </h4>
                                {selectedTemplate.items?.map((item: any, i: number) => (
                                    <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="h-16 w-16 bg-white rounded-lg flex items-center justify-center border border-slate-100 shrink-0 overflow-hidden">
                                            {item.drugs?.image_url ? (
                                                <img src={item.drugs.image_url} className="h-full w-full object-cover" alt={item.drugs?.name} />
                                            ) : (
                                                <Pill size={24} className="text-slate-300" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-700 text-base">{item.drugs?.name}</p>
                                            <p className="text-xs text-slate-500 font-medium">Số lượng: <span className="font-bold text-slate-900">{item.quantity} {item.drugs?.unit}</span></p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
                            <button
                                onClick={() => {
                                    setIsDeleting(selectedTemplate.id);
                                }}
                                className="px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors flex items-center justify-center"
                            >
                                <Trash2 size={20} />
                            </button>
                            <button
                                onClick={() => openEditModal(selectedTemplate)}
                                className="px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors flex items-center justify-center"
                            >
                                <Edit3 size={20} />
                            </button>
                            <button
                                onClick={() => handleCreateOrder(selectedTemplate)}
                                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <ShoppingBag size={20} />
                                Tạo đơn hàng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <DrugPicker
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onSelect={(drug) => {
                    // Check if drug already exists in selectedDrugs to avoid duplicates
                    if (!selectedDrugs.some(d => d.drug_id === drug.id)) {
                        setSelectedDrugs([...selectedDrugs, { ...drug, drug_id: drug.id, quantity: 1 }]);
                    } else {
                        toast.error('Thuốc này đã có trong danh sách');
                    }
                    setIsPickerOpen(false);
                }}
            />

            <ConfirmDialog
                isOpen={!!isDeleting}
                onClose={() => setIsDeleting(null)}
                onConfirm={handleDelete}
                title="Xóa đơn mẫu?"
                description="Đơn mẫu sẽ bị xóa khỏi danh sách nhưng lịch sử đơn hàng cũ vẫn được giữ nguyên."
            />
        </Container>
    );
}
