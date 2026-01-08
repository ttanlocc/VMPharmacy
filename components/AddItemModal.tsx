'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Pill, ShoppingBag, ChevronDown, ChevronUp, Plus, Trash2, CheckCircle2, ClipboardList } from 'lucide-react';
import { useCheckout, CheckoutItem } from '@/app/context/CheckoutContext';
import { useDrugs } from '@/hooks/useDrugs';
import { useDrugGroups } from '@/hooks/useDrugGroups';
import { useTemplates } from '@/hooks/useTemplates';
import { DrugItem } from './DrugItem';
import { Input } from './ui/Input';
import LoadingSpinner from './LoadingSpinner';
import { cn, formatCurrency } from '@/lib/utils';


interface AddItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: 'drug' | 'template';
}

export default function AddItemModal({ isOpen, onClose, initialTab = 'drug' }: AddItemModalProps) {
    const [activeTab, setActiveTab] = useState<'drug' | 'template'>(initialTab);

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]);

    const { items, addItem, removeItem, total } = useCheckout();
    const [showCartPreview, setShowCartPreview] = useState(false);

    // --- Drug Logic ---
    const { drugs, loading: drugsLoading } = useDrugs();
    const { groups } = useDrugGroups();
    const [drugSearch, setDrugSearch] = useState('');
    const [selectedGroup, setSelectedGroup] = useState<string>('all');

    const filteredDrugs = drugs.filter(d => {
        const matchesSearch = d.name.toLowerCase().includes(drugSearch.toLowerCase());
        const matchesGroup = selectedGroup === 'all' || d.group_id === selectedGroup;
        return matchesSearch && matchesGroup;
    });

    const handleAddDrug = (drug: any) => {
        addItem({
            drug_id: drug.id,
            name: drug.name,
            unit: drug.unit,
            price: drug.unit_price,
            image: drug.image_url,
            quantity: 1,
            note: '',
            type: 'drug'
        });
        // Feedback?
    };

    // --- Template Logic ---
    const { templates, loading: templatesLoading } = useTemplates();
    const [templateSearch, setTemplateSearch] = useState('');
    const [expandedTemplateIds, setExpandedTemplateIds] = useState<string[]>([]);

    const filteredTemplates = templates.filter(t => {
        const query = templateSearch.toLowerCase();
        const nameMatch = t.name.toLowerCase().includes(query);
        const drugsMatch = t.items?.some((item: any) =>
            item.drugs?.name?.toLowerCase().includes(query)
        );
        return nameMatch || drugsMatch;
    });

    const toggleExpandTemplate = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedTemplateIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleAddTemplate = (template: any, e?: React.MouseEvent) => {
        e?.stopPropagation();

        // Calculate the initial total price for the template
        const templateTotal = template.total_price !== null
            ? Number(template.total_price)
            : (template.items?.reduce((acc: number, i: any) => acc + ((i.custom_price || i.drugs?.unit_price || 0) * i.quantity), 0) || 0);

        const templateItem: CheckoutItem = {
            name: template.name,
            price: templateTotal,
            quantity: 1,
            type: 'template',
            template_id: template.id,
            image_url: template.image_url,
            items: template.items?.map((i: any) => ({
                drug_id: i.drug_id,
                name: i.drugs?.name || '',
                quantity: i.quantity,
                unit: i.drugs?.unit || ''
            })) || []
        };

        addItem(templateItem);
    };

    // --- Render ---
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="w-full max-w-5xl bg-slate-50 rounded-t-[2rem] sm:rounded-[2rem] h-[90vh] sm:h-[85vh] flex flex-col overflow-hidden relative z-10 shadow-2xl"
                    >
                        {/* Header with Tabs */}
                        <div className="bg-white px-6 pt-6 pb-4 border-b border-slate-100 flex flex-col gap-4 shrink-0 shadow-sm relative z-20">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Thêm sản phẩm</h3>
                                <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex p-1 bg-slate-100 rounded-xl relative">
                                <button
                                    onClick={() => setActiveTab('drug')}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all z-10",
                                        activeTab === 'drug' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    <Pill size={16} />
                                    Thuốc
                                </button>
                                <button
                                    onClick={() => setActiveTab('template')}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all z-10",
                                        activeTab === 'template' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    <ClipboardList size={16} />
                                    Đơn mẫu
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-hidden relative">

                            {/* Drug Tab */}
                            <div className={cn("absolute inset-0 flex flex-col transition-opacity duration-300", activeTab === 'drug' ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none")}>
                                {/* Search & Filter */}
                                <div className="px-6 py-4 bg-white/50 backdrop-blur-sm space-y-3 shrink-0">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <Input
                                            value={drugSearch}
                                            onChange={(e) => setDrugSearch(e.target.value)}
                                            placeholder="Tìm tên thuốc..."
                                            className="pl-11 bg-white border-slate-200 focus:ring-primary/20"
                                        />
                                    </div>
                                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar mask-gradient-right">
                                        <button
                                            onClick={() => setSelectedGroup('all')}
                                            className={cn(
                                                "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border",
                                                selectedGroup === 'all'
                                                    ? "bg-primary text-white border-primary"
                                                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                                            )}
                                        >
                                            Tất cả
                                        </button>
                                        {groups.map(group => (
                                            <button
                                                key={group.id}
                                                onClick={() => setSelectedGroup(group.id)}
                                                className={cn(
                                                    "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border",
                                                    selectedGroup === group.id
                                                        ? "bg-primary text-white border-primary"
                                                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                                                )}
                                            >
                                                {group.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* List */}
                                <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-32">
                                    {drugsLoading ? (
                                        <LoadingSpinner />
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {filteredDrugs.length > 0 ? filteredDrugs.map(drug => (
                                                <DrugItem
                                                    key={drug.id}
                                                    drug={drug}
                                                    onClick={() => handleAddDrug(drug)}
                                                />
                                            )) : (
                                                <div className="col-span-full py-12 text-center text-slate-400">
                                                    Không tìm thấy thuốc nào
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Template Tab */}
                            <div className={cn("absolute inset-0 flex flex-col transition-opacity duration-300", activeTab === 'template' ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none")}>
                                <div className="px-6 py-4 bg-white/50 backdrop-blur-sm shrink-0">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <Input
                                            value={templateSearch}
                                            onChange={(e) => setTemplateSearch(e.target.value)}
                                            placeholder="Tìm đơn mẫu hoặc thuốc trong đơn..."
                                            className="pl-11 bg-white border-slate-200 focus:ring-blue-500/20"
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-32 space-y-3">
                                    {templatesLoading ? (
                                        <LoadingSpinner />
                                    ) : (
                                        filteredTemplates.map(template => {
                                            const total = template.total_price !== null
                                                ? Number(template.total_price)
                                                : (template.items?.reduce((sum: number, item: any) => sum + ((item.custom_price || item.drugs?.unit_price || 0) * item.quantity), 0) || 0);
                                            const isExpanded = expandedTemplateIds.includes(template.id);

                                            return (
                                                <div
                                                    key={template.id}
                                                    className="w-full bg-white border border-slate-100 rounded-2xl overflow-hidden hover:border-blue-200 hover:shadow-md transition-all"
                                                    onClick={(e) => toggleExpandTemplate(template.id, e)}
                                                >
                                                    <div className="p-4 cursor-pointer">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-bold text-slate-800 text-lg">{template.name}</h4>
                                                            <div className="flex gap-2">
                                                                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-lg self-start">
                                                                    {template.items?.length || 0} món
                                                                </span>
                                                                {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                                                            </div>
                                                        </div>

                                                        {!isExpanded && (
                                                            <div className="flex justify-between items-end mt-3">
                                                                <div className="flex -space-x-1.5 px-2">
                                                                    {template.items?.slice(0, 5).map((item: any, i: number) => (
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
                                                                    onClick={(e) => handleAddTemplate(template, e)}
                                                                    className="h-9 px-4 bg-blue-500 text-white rounded-xl font-bold shadow-md shadow-blue-100 active:scale-95 transition-all flex items-center gap-1 hover:bg-blue-600"
                                                                >
                                                                    <Plus size={16} />
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
                                                                    {template.items?.map((item: any, i: number) => (
                                                                        <li key={i} className="flex justify-between items-center text-sm">
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                                                                                    {item.drugs?.image_url ? (
                                                                                        <img src={item.drugs.image_url} className="w-full h-full object-cover" alt="" />
                                                                                    ) : <Pill size={12} className="text-slate-300" />}
                                                                                </div>
                                                                                <span className="text-slate-700 font-medium line-clamp-1">{item.drugs?.name}</span>
                                                                            </div>
                                                                            <span className="font-bold text-slate-900">x{item.quantity}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                                <button
                                                                    onClick={(e) => handleAddTemplate(template, e)}
                                                                    className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold shadow-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                                                                >
                                                                    <Plus size={18} />
                                                                    Thêm vào đơn ({formatCurrency(total)})
                                                                </button>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer - Mini Cart / Status */}
                        <div className="bg-white border-t border-slate-200 p-4 shrink-0 shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.1)] relative z-30">
                            {/* Preview Overlay */}
                            <AnimatePresence>
                                {showCartPreview && (
                                    <motion.div
                                        initial={{ y: "100%" }}
                                        animate={{ y: 0 }}
                                        exit={{ y: "100%" }}
                                        className="absolute bottom-full left-0 right-0 max-h-[50vh] bg-white border-t border-slate-200 shadow-xl overflow-y-auto rounded-t-2xl p-4"
                                    >
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="font-bold text-slate-700">Giỏ hàng ({items.length})</h4>
                                            <button onClick={() => setShowCartPreview(false)} className="text-xs font-bold text-slate-400">Đóng xem trước</button>
                                        </div>
                                        <div className="space-y-2">
                                            {items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center py-2 border-b border-dashed border-slate-100 last:border-0">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                                                            {item.image_url || item.image ? (
                                                                <img src={item.image_url || item.image || ''} className="w-full h-full object-cover" alt="" />
                                                            ) : <Pill size={16} className="text-slate-300" />}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-800 text-sm line-clamp-1">{item.name}</div>
                                                            <div className="text-xs text-slate-400">{item.unit} x {item.quantity}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-bold text-slate-900 text-sm">{formatCurrency(item.price * item.quantity)}</span>
                                                        <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-500"><Trash2 size={16} /></button>
                                                    </div>
                                                </div>
                                            ))}
                                            {items.length === 0 && <p className="text-center text-slate-400 text-sm py-4">Giỏ hàng trống</p>}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex items-center gap-4">
                                <div
                                    className="flex-1 flex flex-col cursor-pointer"
                                    onClick={() => setShowCartPreview(!showCartPreview)}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-400 uppercase">Tạm tính ({items.length})</span>
                                        <ChevronUp size={14} className={cn("text-slate-400 transition-transform", showCartPreview && "rotate-180")} />
                                    </div>
                                    <span className="text-2xl font-black text-slate-900">{formatCurrency(total)}</span>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    <CheckCircle2 size={20} />
                                    Xong
                                </button>
                            </div>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
