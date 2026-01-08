import { useState } from 'react';
import { X, Save, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { formatCurrency } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';

interface SaveTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, price: number, note?: string) => Promise<void>;
    items: any[];
    total: number;
}

export default function SaveTemplateModal({ isOpen, onClose, onSave, items, total }: SaveTemplateModalProps) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState(total.toString());
    const [note, setNote] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) return;
        setIsSaving(true);
        try {
            await onSave(name, parseFloat(price) || 0, note);
            onClose();
        } catch (error) { // eslint-disable-line
            // User toast handled by parent usually, but we could handle here
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-md bg-white rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                    >
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                                <Save size={20} className="text-indigo-600" />
                                Lưu Đơn Mẫu
                            </h3>
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-5 overflow-y-auto">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Tên đơn mẫu <span className="text-red-500">*</span></label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="VD: Liều cảm cúm 3 ngày"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Giá bán mặc định</label>
                                <Input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="font-bold text-indigo-600"
                                />
                                <p className="text-xs text-slate-500 mt-1 ml-1">Tự động tính từ tổng đơn hiện tại ({formatCurrency(total)})</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Ghi chú</label>
                                <Textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Ghi chú thêm về đơn thuốc này..."
                                    rows={2}
                                />
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Xem trước danh sách thuốc ({items.length})</p>
                                <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                    {items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-sm">
                                            <div className="h-6 w-6 rounded bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                                {item.type === 'template' ? <ClipboardList size={12} className="text-indigo-400" /> : <div className="text-[10px] font-bold text-slate-500">Rx</div>}
                                            </div>
                                            <span className="flex-1 truncate text-slate-700 font-medium">{item.name}</span>
                                            <span className="text-slate-900 font-bold">x{item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] text-slate-500 mt-1 italic text-center">
                                    * Các thuốc trong đơn mẫu con sẽ được gộp thành thuốc lẻ.
                                </p>
                            </div>
                        </div>

                        <div className="p-6 pt-2">
                            <button
                                onClick={handleSave}
                                disabled={!name.trim() || isSaving}
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
                            >
                                {isSaving ? <LoadingSpinner size={24} label="" className="p-0 text-white" /> : 'Lưu Đơn Mẫu'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
