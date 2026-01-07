import { useState } from 'react';
import { useTemplates } from '@/hooks/useTemplates';
import { Pill, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';

interface TemplatePickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (items: any[], template: any) => void;
}

export default function TemplatePicker({ isOpen, onClose, onSelect }: TemplatePickerProps) {
    const { templates, loading } = useTemplates();
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedIds, setExpandedIds] = useState<string[]>([]);

    const filteredTemplates = templates.filter(t => {
        const query = searchTerm.toLowerCase();
        const nameMatch = t.name.toLowerCase().includes(query);
        const drugsMatch = t.items?.some((item: any) =>
            item.drugs?.name?.toLowerCase().includes(query)
        );
        return nameMatch || drugsMatch;
    });

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleSelect = (template: any, e: React.MouseEvent) => {
        e.stopPropagation();
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

        onSelect(items, template);
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
                        className="absolute inset-0 bg-black/30 backdrop-blur-md"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-t-[2.5rem] sm:rounded-[2.5rem] h-[85vh] flex flex-col overflow-hidden relative z-10 shadow-2xl"
                    >
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-xl font-extrabold text-slate-800 uppercase tracking-tight">Chọn Đơn Mẫu</h3>
                                <p className="text-xs text-slate-500 font-medium">Tìm kiếm nhanh theo tên hoặc thuốc</p>
                            </div>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="px-6 py-2 shrink-0">
                            <input
                                type="text"
                                placeholder="🔍 Tìm tên đơn hoặc tên thuốc..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 transition-all text-sm font-medium"
                                autoFocus
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {loading ? (
                                <LoadingSpinner label="Đang tải..." />
                            ) : (
                                filteredTemplates.length > 0 ? (
                                    filteredTemplates.map(template => {
                                        const total = template.total_price !== null
                                            ? Number(template.total_price)
                                            : (template.items?.reduce((sum, item) => sum + ((item.custom_price || item.drugs?.unit_price || 0) * item.quantity), 0) || 0);

                                        const isExpanded = expandedIds.includes(template.id);

                                        return (
                                            <div
                                                key={template.id}
                                                className="w-full bg-white border border-slate-100 rounded-2xl overflow-hidden hover:border-sky-200 hover:shadow-lg hover:shadow-sky-50 transition-all group"
                                                onClick={(e) => toggleExpand(template.id, e)}
                                            >
                                                <div className="p-4 cursor-pointer">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-bold text-slate-800 text-lg group-hover:text-sky-600 transition-colors">{template.name}</h4>
                                                        <div className="flex gap-2">
                                                            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-lg self-start">
                                                                {template.items?.length || 0} món
                                                            </span>
                                                            {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                                                        </div>
                                                    </div>

                                                    {!isExpanded && (
                                                        <div className="flex justify-between items-end mt-3">
                                                            <div className="flex -space-x-1.5">
                                                                {template.items?.slice(0, 5).map((item, i) => (
                                                                    <div key={i} className="w-8 h-8 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center overflow-hidden shadow-sm">
                                                                        {item.drugs?.image_url ? (
                                                                            <img src={item.drugs.image_url} className="w-full h-full object-cover" alt="" />
                                                                        ) : (
                                                                            <Pill size={14} className="text-slate-300" />
                                                                        )}
                                                                    </div>
                                                                ))}
                                                                {template.items && template.items.length > 5 && (
                                                                    <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                                        +{template.items.length - 5}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={(e) => handleSelect(template, e)}
                                                                className="h-10 px-4 bg-sky-500 text-white rounded-xl font-bold shadow-lg shadow-sky-200 active:scale-95 transition-all flex items-center gap-1 hover:bg-sky-600"
                                                            >
                                                                <Plus size={18} />
                                                                <span className="text-sm">{formatCurrency(total)}</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="bg-slate-50 border-t border-slate-100 px-4 py-3"
                                                        >
                                                            <ul className="space-y-2 mb-4">
                                                                {template.items?.map((item, i) => (
                                                                    <li key={i} className="flex justify-between items-center text-sm">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                                                                {item.drugs?.image_url ? (
                                                                                    <img src={item.drugs.image_url} className="w-full h-full object-cover rounded-[3px]" />
                                                                                ) : <Pill size={12} className="text-slate-300" />}
                                                                            </div>
                                                                            <span className="text-slate-700 font-medium line-clamp-1">{item.drugs?.name}</span>
                                                                        </div>
                                                                        <span className="font-bold text-slate-900">x{item.quantity}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                            <button
                                                                onClick={(e) => handleSelect(template, e)}
                                                                className="w-full py-3 bg-sky-500 text-white rounded-xl font-bold shadow-md hover:bg-sky-600 transition-colors flex items-center justify-center gap-2"
                                                            >
                                                                <Plus size={18} />
                                                                Thêm vào đơn - {formatCurrency(total)}
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="text-center py-10 text-slate-400">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Pill size={24} className="opacity-50" />
                                        </div>
                                        Không tìm thấy đơn mẫu nào
                                    </div>
                                )
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
