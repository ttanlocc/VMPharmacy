'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomers } from '@/hooks/useCustomers';
import { Search, Plus, User, ArrowLeft, Loader2, Check, Phone, Edit3 } from 'lucide-react';
import Container from '@/components/Container';
import toast from 'react-hot-toast'; // Assuming toast is available, if not I'll standard alert or just error handle
// Actually, let's use toast if it's in layout, which it is.
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';

export default function CustomerSelectPage() {
    const router = useRouter();
    const { customers, loading, searchCustomers, createCustomer, updateCustomer } = useCustomers();
    const [query, setQuery] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<any | null>(null);

    // New Customer Form
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newYear, setNewYear] = useState('');
    const [newHistory, setNewHistory] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isCreating && !editingCustomer) {
                searchCustomers(query);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [query, isCreating, editingCustomer, searchCustomers]);

    const handleSelect = (customer: any) => {
        router.push(`/checkout/new?customerId=${customer.id}`);
    };

    const openEditModal = (customer: any) => {
        setEditingCustomer(customer);
        setNewName(customer.name);
        setNewPhone(customer.phone);
        setNewYear(customer.birth_year ? String(customer.birth_year) : '');
        setNewHistory(customer.medical_history || '');
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCustomer) {
                // Update
                const updated = await updateCustomer({
                    id: editingCustomer.id,
                    name: newName,
                    phone: newPhone,
                    birth_year: newYear ? parseInt(newYear) : null,
                    medical_history: newHistory || null
                });
                toast.success('Cập nhật thành công');
                // Don't auto select on edit, just close modal
                setEditingCustomer(null);
                resetForm();
            } else {
                // Create
                const customer = await createCustomer({
                    name: newName,
                    phone: newPhone,
                    birth_year: newYear ? parseInt(newYear) : null,
                    medical_history: newHistory || null
                });

                if (customer) {
                    toast.success('Đã thêm khách hàng');
                    handleSelect(customer); // Select immediately on create
                }
            }
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra');
        }
    };

    const resetForm = () => {
        setNewName('');
        setNewPhone('');
        setNewYear('');
        setNewHistory('');
    };

    const isFormOpen = isCreating || !!editingCustomer;

    const closeForm = () => {
        setIsCreating(false);
        setEditingCustomer(null);
        resetForm();
    };

    return (
        <Container>
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-3 bg-white shadow-sm border border-slate-100 rounded-2xl text-slate-600 active:scale-90 transition-transform"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Chọn khách hàng</h1>
                    <p className="text-sm font-medium text-slate-500">Tìm kiếm hoặc thêm mới</p>
                </div>
            </div>

            {!isFormOpen ? (
                <div className="space-y-6">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            autoFocus
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Tìm theo tên hoặc SĐT..."
                            className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-300 transition-all text-lg font-bold shadow-sm"
                        />
                        {loading && (
                            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-sky-500 animate-spin" size={20} />
                        )}
                    </div>

                    {/* New Customer Button */}
                    <button
                        onClick={() => {
                            resetForm();
                            setIsCreating(true);
                        }}
                        className="w-full py-4 bg-white border-2 border-dashed border-sky-200 text-sky-600 rounded-2xl font-bold hover:bg-sky-50 hover:border-sky-300 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={20} /> Thêm khách hàng mới
                    </button>

                    {/* List */}
                    <div className="space-y-3">
                        {customers.length > 0 ? (
                            customers.map(c => (
                                <motion.div
                                    key={c.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="group relative"
                                >
                                    <div
                                        onClick={() => handleSelect(c)}
                                        className="w-full flex items-center gap-4 p-4 bg-white/60 backdrop-blur rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:bg-white hover:border-sky-200 transition-all cursor-pointer"
                                    >
                                        <div className="h-12 w-12 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 rounded-2xl flex items-center justify-center shrink-0 font-black text-lg group-hover:from-sky-100 group-hover:to-blue-100 group-hover:text-sky-600 transition-colors">
                                            {c.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-900 text-lg">{c.name}</h3>
                                            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                                <Phone size={14} />
                                                {c.phone}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openEditModal(c);
                                                }}
                                                className="h-10 w-10 rounded-full bg-slate-100 text-slate-400 hover:bg-sky-100 hover:text-sky-500 flex items-center justify-center transition-colors"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <div className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-300 group-hover:border-sky-200 group-hover:bg-sky-50 group-hover:text-sky-500 transition-all">
                                                <Check size={20} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            query && !loading && (
                                <div className="text-center py-10 text-slate-400 font-medium bg-white/40 rounded-3xl border border-dashed border-slate-200">
                                    Không tìm thấy khách hàng nào.
                                </div>
                            )
                        )}
                    </div>
                </div>
            ) : (
                /* Create/Edit Customer Form */
                <GlassCard className="!p-6">
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-black text-slate-800">
                                {editingCustomer ? 'Chỉnh sửa thông tin' : 'Thêm khách hàng mới'}
                            </h3>
                            <button
                                type="button"
                                onClick={closeForm}
                                className="px-4 py-2 bg-slate-100 rounded-xl text-slate-500 font-bold hover:bg-slate-200 transition-colors"
                            >
                                Hủy
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Họ và tên</label>
                            <input
                                required
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                placeholder="Nhập tên khách hàng"
                                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-transparent focus:bg-white focus:border-sky-200 outline-none font-bold text-lg transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Số điện thoại</label>
                            <input
                                required
                                value={newPhone}
                                onChange={e => setNewPhone(e.target.value)}
                                placeholder="Nhập số điện thoại"
                                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-transparent focus:bg-white focus:border-sky-200 outline-none font-bold text-lg transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Năm sinh</label>
                                <input
                                    type="number"
                                    value={newYear}
                                    onChange={e => setNewYear(e.target.value)}
                                    placeholder="VD: 1990"
                                    className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-transparent focus:bg-white focus:border-sky-200 outline-none font-bold text-lg transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Ghi chú y tế</label>
                            <textarea
                                value={newHistory}
                                onChange={e => setNewHistory(e.target.value)}
                                placeholder="Tiền sử bệnh, dị ứng..."
                                rows={3}
                                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-transparent focus:bg-white focus:border-sky-200 outline-none font-medium text-lg resize-none transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 mt-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-sky-200 hover:shadow-sky-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Check size={24} />}
                            {editingCustomer ? 'Cập Nhật' : 'Lưu & Chọn'}
                        </button>
                    </form>
                </GlassCard>
            )}
        </Container>
    );
}
