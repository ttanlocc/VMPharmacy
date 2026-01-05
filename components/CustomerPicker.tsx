import { useState, useEffect } from 'react';
import { useCustomers } from '@/hooks/useCustomers';
import { Database } from '@/types/database';
import { Search, Plus, User, Phone, Check, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Customer = Database['public']['Tables']['customers']['Row'];

interface CustomerPickerProps {
    onSelect: (customer: Customer | null) => void;
    selectedCustomer: Customer | null;
}

export default function CustomerPicker({ onSelect, selectedCustomer }: CustomerPickerProps) {
    const { customers, loading, searchCustomers, createCustomer } = useCustomers();
    const [query, setQuery] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // New Customer Form
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newYear, setNewYear] = useState('');
    const [newHistory, setNewHistory] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            if (isOpen && !isCreating) {
                searchCustomers(query);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [query, isOpen, isCreating, searchCustomers]);

    const handleCreateWrapper = async (e: React.FormEvent) => {
        e.preventDefault();
        const customer = await createCustomer({
            name: newName,
            phone: newPhone,
            birth_year: newYear ? parseInt(newYear) : null,
            medical_history: newHistory || null
        });

        if (customer) {
            onSelect(customer);
            setIsCreating(false);
            setIsOpen(false);
            setNewName('');
            setNewPhone('');
            setNewYear('');
            setNewHistory('');
        }
    };

    return (
        <div className="relative z-20">
            {selectedCustomer ? (
                <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center shrink-0">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900">{selectedCustomer.name}</p>
                            <p className="text-xs font-medium text-slate-500">{selectedCustomer.phone}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => onSelect(null)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            ) : (
                <>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-full flex items-center gap-3 p-4 bg-white border border-slate-200 border-dashed rounded-2xl text-slate-500 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-600 transition-all font-bold"
                    >
                        <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center">
                            <User size={20} />
                        </div>
                        <span className="flex-1 text-left">Chọn khách hàng (Tích điểm/Lịch sử)</span>
                        <Search size={20} />
                    </button>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden p-4"
                            >
                                {!isCreating ? (
                                    <>
                                        <div className="relative mb-4">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                autoFocus
                                                value={query}
                                                onChange={(e) => setQuery(e.target.value)}
                                                placeholder="Tìm theo tên hoặc SĐT..."
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-sky-100 font-medium"
                                            />
                                            {loading && (
                                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-500 animate-spin" size={18} />
                                            )}
                                        </div>

                                        <div className="max-h-60 overflow-y-auto space-y-1 mb-2">
                                            {customers.length > 0 ? (
                                                customers.map(c => (
                                                    <button
                                                        key={c.id}
                                                        onClick={() => { onSelect(c); setIsOpen(false); }}
                                                        className="w-full text-left p-3 hover:bg-slate-50 rounded-xl flex items-center justify-between group transition-colors"
                                                    >
                                                        <div>
                                                            <p className="font-bold text-slate-800">{c.name}</p>
                                                            <p className="text-xs text-slate-500">{c.phone}</p>
                                                        </div>
                                                        <Check size={16} className="text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </button>
                                                ))
                                            ) : (
                                                query && !loading && (
                                                    <div className="text-center py-4 text-slate-400 text-sm">
                                                        Không tìm thấy khách hàng
                                                    </div>
                                                )
                                            )}
                                        </div>

                                        <button
                                            onClick={() => setIsCreating(true)}
                                            className="w-full py-3 bg-sky-50 text-sky-600 rounded-xl font-bold hover:bg-sky-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Plus size={18} /> Thêm khách hàng mới
                                        </button>
                                    </>
                                ) : (
                                    <form onSubmit={handleCreateWrapper} className="space-y-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-bold text-slate-800">Thêm mới</h4>
                                            <button type="button" onClick={() => setIsCreating(false)} className="text-sm text-slate-400 font-bold hover:text-slate-600">Hủy</button>
                                        </div>
                                        <input
                                            required
                                            value={newName}
                                            onChange={e => setNewName(e.target.value)}
                                            placeholder="Tên khách hàng"
                                            className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-transparent focus:bg-white focus:border-sky-200 outline-none font-medium"
                                        />
                                        <input
                                            required
                                            value={newPhone}
                                            onChange={e => setNewPhone(e.target.value)}
                                            placeholder="Số điện thoại"
                                            className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-transparent focus:bg-white focus:border-sky-200 outline-none font-medium"
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                type="number"
                                                value={newYear}
                                                onChange={e => setNewYear(e.target.value)}
                                                placeholder="Năm sinh (tùy chọn)"
                                                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-transparent focus:bg-white focus:border-sky-200 outline-none font-medium"
                                            />
                                        </div>
                                        <textarea
                                            value={newHistory}
                                            onChange={e => setNewHistory(e.target.value)}
                                            placeholder="Tiền sử bệnh, dị ứng... (tùy chọn)"
                                            rows={2}
                                            className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-transparent focus:bg-white focus:border-sky-200 outline-none font-medium resize-none"
                                        />
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-3 bg-sky-500 text-white rounded-xl font-bold shadow-lg shadow-sky-200 hover:shadow-sky-300 transition-all flex items-center justify-center gap-2"
                                        >
                                            {loading ? <Loader2 className="animate-spin" /> : <Check size={18} />} Lưu khách hàng
                                        </button>
                                    </form>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </div>
    );
}
