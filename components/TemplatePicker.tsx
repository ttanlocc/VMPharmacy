import { useState } from 'react';
import { useTemplates } from '@/hooks/useTemplates';
import { Pill, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';

interface TemplatePickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (items: any[]) => void;
}

export default function TemplatePicker({ isOpen, onClose, onSelect }: TemplatePickerProps) {
    const { templates, loading } = useTemplates();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (template: any) => {
        // Map template items to cart items format
        const items = template.items?.map((item: any) => ({
            drug_id: item.drug_id,
            name: item.drugs?.name || '',
            unit: item.drugs?.unit || '',
            price: item.custom_price || item.drugs?.unit_price || 0,
            image: item.drugs?.image_url || null,
            quantity: item.quantity,
            note: item.note
        })) || [];

        onSelect(items);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/20 backdrop-blur-md"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-t-[2.5rem] sm:rounded-[2.5rem] h-[80vh] flex flex-col overflow-hidden relative z-10 shadow-2xl"
                    >
                        <div className="p-6 border-b border-slate-100/50 flex justify-between items-center shrink-0">
                            <h3 className="text-xl font-extrabold text-slate-800 uppercase tracking-tight">Chọn Đơn Mẫu</h3>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {loading ? (
                                <LoadingSpinner />
                            ) : (
                                filteredTemplates.length > 0 ? (
                                    filteredTemplates.map(template => {
                                        const total = template.items?.reduce((sum, item) => sum + (item.drugs?.unit_price * item.quantity), 0) || 0;
                                        return (
                                            <button
                                                key={template.id}
                                                onClick={() => handleSelect(template)}
                                                className="w-full text-left p-4 bg-white/60 border border-slate-100 rounded-2xl hover:bg-white hover:border-sky-200 hover:shadow-lg hover:shadow-sky-100 transition-all group"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-slate-800 text-lg group-hover:text-sky-600 transition-colors">{template.name}</h4>
                                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">
                                                        {template.items?.length || 0} món
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-end">
                                                    <div className="flex -space-x-1">
                                                        {template.items?.slice(0, 4).map((item, i) => (
                                                            <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border border-white flex items-center justify-center overflow-hidden">
                                                                {item.drugs?.image_url ? (
                                                                    <img src={item.drugs.image_url} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <Pill size={12} className="text-slate-400" />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <span className="font-black text-slate-900">{formatCurrency(total)}</span>
                                                </div>
                                            </button>
                                        )
                                    })
                                ) : (
                                    <div className="text-center py-10 text-slate-400">Không có đơn mẫu nào</div>
                                )
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
