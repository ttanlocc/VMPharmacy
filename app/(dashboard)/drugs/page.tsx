'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useDrugs, Drug } from '@/hooks/useDrugs';
import { useDrugGroups } from '@/hooks/useDrugGroups';
import { Plus, Search, Image as ImageIcon, X, Trash2, FolderPlus } from 'lucide-react';
import Container from '@/components/Container';
import DrugCard from '@/components/DrugCard';
import SwipeableItem from '@/components/SwipeableItem';
import LoadingSpinner from '@/components/LoadingSpinner';
import ConfirmDialog from '@/components/ConfirmDialog';
import { DrugGroupManager } from '@/components/DrugGroupManager';
import { uploadDrugImage } from '@/lib/upload';
import { cn } from '@/lib/utils';
import { DRUG_UNITS } from '@/lib/constants';

export default function DrugsPage() {
    const { drugs, loading, addDrug, updateDrug, deleteDrug } = useDrugs();
    const { groups } = useDrugGroups();
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDrug, setEditingDrug] = useState<Drug | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [unit, setUnit] = useState(DRUG_UNITS[0]);
    const [groupId, setGroupId] = useState<string>('');
    const [imageUrl, setImageUrl] = useState('');

    const filteredDrugs = drugs.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase())
    );

    const resetForm = () => {
        setName('');
        setPrice('');
        setUnit(DRUG_UNITS[0]);
        setGroupId('');
        setImageUrl('');
        setEditingDrug(null);
    };

    const openAddModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (drug: Drug) => {
        setEditingDrug(drug);
        setName(drug.name);
        setPrice(drug.unit_price.toString());
        setUnit(drug.unit);
        setGroupId(drug.group_id || '');
        setImageUrl(drug.image_url || '');
        setIsModalOpen(true);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const url = await uploadDrugImage(file);
            setImageUrl(url);
            toast.success('Upload ảnh thành công');
        } catch (error: any) {
            toast.error(error.message || 'Upload ảnh thất bại');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            name,
            unit,
            unit_price: parseFloat(price),
            group_id: groupId || null,
            image_url: imageUrl,
        };

        try {
            if (editingDrug) {
                await updateDrug(editingDrug.id, payload);
                toast.success('Cập nhật thuốc thành công');
            } else {
                await addDrug(payload);
                toast.success('Thêm thuốc thành công');
            }
            setIsModalOpen(false);
            resetForm();
        } catch (error: any) {
            toast.error(error.message || 'Thao tác thất bại');
            console.error(error);
        }
    };

    return (
        <Container className="bg-slate-50 min-h-screen">
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Kho thuốc</h1>
                        <p className="text-slate-500 text-sm font-medium">Quản lý danh mục thuốc của bạn</p>
                    </div>
                    <div className="flex gap-2">
                        <DrugGroupManager />
                        <button
                            onClick={openAddModal}
                            className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg active:scale-95 transition-transform"
                        >
                            <Plus size={24} />
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm tên thuốc..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                </div>

                {/* List */}
                {loading ? (
                    <LoadingSpinner label="Đang tải danh sách thuốc..." className="mt-20" />
                ) : (
                    <div className="space-y-3">
                        {filteredDrugs.length > 0 ? (
                            filteredDrugs.map(drug => (
                                <SwipeableItem
                                    key={drug.id}
                                    onEdit={() => openEditModal(drug)}
                                    onDelete={() => setIsDeleting(drug.id)}
                                    className="rounded-2xl"
                                >
                                    <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl">
                                        <div className="relative h-16 w-16 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                                            {drug.image_url ? (
                                                <img src={drug.image_url} alt={drug.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <ImageIcon size={24} className="text-slate-300" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-900">{drug.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-bold text-slate-500 px-2 py-0.5 bg-slate-100 rounded-full uppercase tracking-wider">
                                                    {drug.unit}
                                                </span>
                                                <span className="text-sm font-bold text-primary">
                                                    {new Intl.NumberFormat('vi-VN').format(drug.unit_price)} đ
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </SwipeableItem>
                            ))
                        ) : (
                            <div className="text-center py-20 text-slate-400 font-medium">
                                Chưa có thuốc nào trong danh sách
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal Add/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                            <h3 className="text-xl font-extrabold text-slate-900">
                                {editingDrug ? 'Cập nhật thuốc' : 'Thêm thuốc mới'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Image Upload */}
                            <div className="flex justify-center">
                                <div
                                    className="relative h-32 w-32 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden"
                                    onClick={() => document.getElementById('imageInput')?.click()}
                                >
                                    {imageUrl ? (
                                        <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <>
                                            {uploading ? (
                                                <LoadingSpinner size={20} label="" className="p-0" />
                                            ) : (
                                                <>
                                                    <ImageIcon size={28} className="text-slate-300" />
                                                    <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Chọn ảnh</span>
                                                </>
                                            )}
                                        </>
                                    )}
                                    <input
                                        id="imageInput"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Tên thuốc</label>
                                    <input
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="VD: Panadol Extra"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Nhóm thuốc</label>
                                        <select
                                            value={groupId}
                                            onChange={(e) => setGroupId(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all appearance-none"
                                        >
                                            <option value="">Chọn nhóm...</option>
                                            {groups.map(g => (
                                                <option key={g.id} value={g.id}>{g.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Giá bán (đ)</label>
                                        <input
                                            required
                                            type="number"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            placeholder="5.000"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                                        />
                                    </div>
                                    <div className="w-1/3">
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Đơn vị</label>
                                        <select
                                            value={unit}
                                            onChange={(e) => setUnit(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all appearance-none"
                                        >
                                            {DRUG_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={uploading}
                                className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-sky-100 hover:bg-sky-600 active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {editingDrug ? 'Lưu thay đổi' : 'Thêm vào kho'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            <ConfirmDialog
                isOpen={!!isDeleting}
                onClose={() => setIsDeleting(null)}
                onConfirm={() => isDeleting && deleteDrug(isDeleting)}
                title="Xóa thuốc?"
                description="Hành động này không thể hoàn tác. Mọi đơn mẫu chứa thuốc này sẽ bị ảnh hưởng."
            />
        </Container>
    );
}
