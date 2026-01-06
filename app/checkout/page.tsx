/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, ShoppingBag, Trash2, Edit3, Pill, CheckCircle2, FileText, User, UserPlus, X, ClipboardList } from 'lucide-react';
import Container from '@/components/Container';
import SwipeableItem from '@/components/SwipeableItem';
import DrugPicker from '@/components/DrugPicker';
import CustomerPicker from '@/components/CustomerPicker';
import TemplatePicker from '@/components/TemplatePicker';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrders } from '@/hooks/useOrders';
import { useCheckout, CheckoutItem } from '@/app/context/CheckoutContext';
import { supabase } from '@/lib/supabase';

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    // Legacy support or direct link support:
    const templateIdParam = searchParams.get('templateId');
    const customerIdParam = searchParams.get('customerId');

    const { createOrder } = useOrders();
    const {
        items,
        customer,
        setCustomer,
        addItem,
        addItems,
        removeItem,
        updateItem,
        clearCheckout
    } = useCheckout();

    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCustomerPickerOpen, setIsCustomerPickerOpen] = useState(false);

    // Legacy loading logic for direct URL access
    useEffect(() => {
        const loadInitialState = async () => {
            // Only load if context is empty and we have params
            if (items.length === 0 && !customer && (templateIdParam || customerIdParam)) {
                if (customerIdParam) {
                    const { data } = await supabase.from('customers').select('*').eq('id', customerIdParam).single();
                    if (data) setCustomer(data);
                }

                if (templateIdParam) {
                    const { data } = await supabase
                        .from('template_items')
                        .select('*, drugs(*)')
                        .eq('template_id', templateIdParam);

                    if (data) {
                        const formattedItems: CheckoutItem[] = data.map((item: any) => ({
                            drug_id: item.drug_id,
                            name: item.drugs?.name || '',
                            unit: item.drugs?.unit || '',
                            price: item.custom_price || item.drugs?.unit_price || 0,
                            image: item.drugs?.image_url || null,
                            quantity: item.quantity,
                            note: item.note,
                            type: 'template',
                            template_id: templateIdParam,
                            image_url: null // Legacy load doesn't fetch template image potentially
                        }));
                        addItems(formattedItems);
                    }
                }
            }
        };
        loadInitialState();
    }, [templateIdParam, customerIdParam]); // Only runs on mount/param change if empty

    // Price Edit Modal State
    const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
    const [editPriceValue, setEditPriceValue] = useState<string>('');

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
    };

    const handleUpdateQuantity = (index: number, delta: number) => {
        const item = items[index];
        const newQuantity = Math.max(1, item.quantity + delta);
        updateItem(index, { quantity: newQuantity });
    };

    const openPriceEditor = (index: number) => {
        setEditingItemIndex(index);
        setEditPriceValue(items[index].price.toString());
    };

    const savePrice = () => {
        if (editingItemIndex !== null) {
            const newPrice = parseFloat(editPriceValue);
            if (!isNaN(newPrice) && newPrice >= 0) {
                updateItem(editingItemIndex, { price: newPrice });
            }
            setEditingItemIndex(null);
            setEditPriceValue('');
        }
    };

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleCheckout = async () => {
        if (items.length === 0) return;

        setIsSubmitting(true);
        try {
            // Flatten items for the API
            // The API expects a list of DRUGS with quantities.
            // If we have a 'template' item, we need to expand it into its drugs.
            // The API also expects 'total_price' which it uses for distribution.
            // If we have mixed items (Template + Drugs), the API logic (assuming Single Template) will be weird.
            // But we will send the hierarchy.

            // To support the "Distribute Manual Price" logic correctly:
            // The API takes `total_price` and `items`.

            // Strategy: 
            // 1. Expand template items into individual drug lines.
            // 2. Pass the template_id of the first template item (as per limitation).
            // 3. The `total_price` passed is `total`.

            const flattenedItems = items.flatMap(item => {
                if (item.type === 'template' && item.items) {
                    // For a template item with Quantity Q:
                    // It contains Drugs [d1, d2] each with q1, q2.
                    // The result should include [d1, d2] repeated Q times? 
                    // No, multiply their quantities by Q.
                    return item.items.map(subItem => ({
                        drug_id: subItem.drug_id,
                        quantity: subItem.quantity * item.quantity,
                        note: '', // Propagate note?
                        // We do NOT send unit_price here because the API will calculate it based on total_price distribution?
                        // BUT: If we have mixed items...
                        // If we don't send unit_price, API fetches standard price.
                        // If we are strictly creating a TEMPLATE order, this works.
                    }));
                } else {
                    return [{
                        drug_id: item.drug_id,
                        quantity: item.quantity,
                        note: item.note,
                        // unit_price: item.price // API might ignore this if distribution kicks in
                    }];
                }
            });

            const templateItem = items.find(i => i.type === 'template');
            const primaryTemplateId = templateItem?.template_id || templateIdParam || null;

            await createOrder(flattenedItems, total, customer?.id, primaryTemplateId);
            setIsSuccess(true);
            clearCheckout();
            setTimeout(() => {
                router.push('/');
            }, 2500);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddTemplateItems = (newItems: any[], template: any) => {
        // Create a single "Template Item"
        // Calculate the initial total price for the template (either manual override or sum of parts)
        const templateTotal = template.total_price !== null ? Number(template.total_price) : newItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);

        const templateItem: CheckoutItem = {
            name: template.name,
            price: templateTotal,
            quantity: 1,
            type: 'template',
            template_id: template.id,
            image_url: template.image_url,
            // Store the raw items so we can expand them later or show them
            items: newItems.map(i => ({
                drug_id: i.drug_id,
                name: i.name,
                quantity: i.quantity,
                unit: i.unit
            }))
        };

        addItem(templateItem);
    };

    if (isSuccess) {
        return (
            <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 15 }}
                >
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={48} strokeWidth={3} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">Thanh toán xong!</h2>
                    <p className="text-slate-500 font-medium">Đơn hàng đã được lưu.<br />Đang quay lại sảnh...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <Container className="bg-slate-50 min-h-screen">
            <div className="flex flex-col gap-6">
                {/* Header with Customer Info */}
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-3 bg-white shadow-sm border border-slate-100 rounded-2xl text-slate-600 active:scale-90 transition-transform">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Thanh toán</h1>
                        {/* Customer Bar */}
                        <div className="flex items-center gap-2 mt-1">
                            {customer ? (
                                <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
                                    <User size={14} className="fill-indigo-700" />
                                    <span className="text-sm font-bold">{customer.name}</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-500 rounded-lg">
                                    <User size={14} />
                                    <span className="text-sm font-bold">Khách lẻ</span>
                                </div>
                            )}
                            <button
                                onClick={() => setIsCustomerPickerOpen(true)}
                                className="text-xs font-bold text-slate-400 hover:text-sky-500 underline decoration-dashed"
                            >
                                Đổi
                            </button>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{items.length} món</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* LEFT COLUMN: Item List */}
                    <div className="lg:col-span-8 space-y-3">
                        <AnimatePresence mode="popLayout">
                            {items.map((item, index) => (
                                <motion.div
                                    key={`${item.type}-${item.drug_id || item.template_id}-${index}`}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                >
                                    <SwipeableItem
                                        onDelete={() => removeItem(index)}
                                        // Enable edit for both, but for template it edits the TOTAL
                                        onEdit={() => openPriceEditor(index)}
                                        className="rounded-2xl"
                                        showHint={index === 0}
                                    >
                                        <div className={`flex flex-col sm:flex-row gap-4 p-4 ${item.type === 'template' ? 'bg-indigo-50/50 border-indigo-100' : 'bg-white border-slate-100'} border rounded-2xl relative overflow-hidden`}>
                                            {/* Item Content */}
                                            <div className="flex items-center gap-4 w-full">
                                                <div className="h-20 w-20 bg-white rounded-xl flex items-center justify-center shrink-0 overflow-hidden shadow-sm border border-slate-100 relative">
                                                    {item.image || item.image_url ? (
                                                        <img
                                                            src={item.image || item.image_url || ''}
                                                            className="h-full w-full object-cover"
                                                            alt={item.name}
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        item.type === 'template' ? <ClipboardList size={32} className="text-indigo-400" /> : <Pill size={32} className="text-slate-300" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className={`font-bold ${item.type === 'template' ? 'text-indigo-900' : 'text-slate-800'} text-base`}>{item.name}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <p className="text-sm font-bold text-primary flex items-center gap-1">
                                                            {formatCurrency(item.price)}
                                                        </p>
                                                        <span className="text-xs text-slate-500 font-medium">/ {item.type === 'template' ? 'đơn' : item.unit}</span>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); openPriceEditor(index); }}
                                                            className="p-1 text-slate-400 hover:text-sky-500 transition-colors"
                                                        >
                                                            <Edit3 size={16} />
                                                        </button>
                                                    </div>

                                                    {/* Template Sub-items List (Requested: Show list only, no individual prices) */}
                                                    {item.type === 'template' && item.items && (
                                                        <div className="mt-2 pl-3 border-l-2 border-indigo-200">
                                                            <p className="text-[10px] font-bold text-indigo-500 uppercase mb-1">Gồm {item.items.length} loại thuốc:</p>
                                                            <ul className="text-xs text-slate-600 font-medium space-y-1">
                                                                {item.items.map((sub, i) => (
                                                                    <li key={i} className="flex justify-between">
                                                                        <span>• {sub.name}</span>
                                                                        <span className="font-bold text-slate-500">x{sub.quantity} {sub.unit}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end gap-2 shrink-0">
                                                    <div className="flex items-center bg-white rounded-xl border border-slate-200 px-1 py-1 shadow-sm">
                                                        <button
                                                            onClick={() => handleUpdateQuantity(index, -1)}
                                                            className="w-8 h-8 flex items-center justify-center font-bold text-slate-400 hover:text-slate-600 transition-colors"
                                                        >-</button>
                                                        <span className="w-8 text-center font-black text-sm text-slate-900">{item.quantity}</span>
                                                        <button
                                                            onClick={() => handleUpdateQuantity(index, 1)}
                                                            className="w-8 h-8 flex items-center justify-center font-bold text-slate-400 hover:text-slate-600 transition-colors"
                                                        >+</button>
                                                    </div>
                                                    <span className="text-sm font-black text-slate-900">{formatCurrency(item.price * item.quantity)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </SwipeableItem>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {items.length === 0 && (
                            <div className="py-20 text-center text-slate-300 font-medium border-2 border-dashed border-slate-100 rounded-3xl">
                                Chưa có thuốc nào trong giỏ
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setIsPickerOpen(true)}
                                className="py-4 border border-slate-200 bg-white rounded-2xl flex items-center justify-center gap-2 text-slate-500 font-bold hover:border-primary hover:text-primary transition-all active:scale-[0.98] shadow-sm"
                            >
                                <Plus size={20} /> Thêm thuốc
                            </button>
                            <button
                                onClick={() => setIsTemplatePickerOpen(true)}
                                className="py-4 border border-slate-200 bg-white rounded-2xl flex items-center justify-center gap-2 text-slate-500 font-bold hover:border-sky-500 hover:text-sky-500 transition-all active:scale-[0.98] shadow-sm"
                            >
                                <FileText size={20} /> Đơn mẫu
                            </button>
                        </div>

                        {/* Mobile Spacer for Bottom Bar */}
                        <div className="h-40 lg:hidden" />
                    </div>

                    {/* RIGHT COLUMN: Sticky Sidebar (Desktop Only) */}
                    <div className="hidden lg:block lg:col-span-4 sticky top-6 space-y-6">
                        {/* Customer Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Khách hàng</h3>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${customer ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                    <User size={24} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{customer ? customer.name : 'Khách lẻ'}</p>
                                    <p className="text-xs text-slate-500">{customer ? customer.phone : 'Không có thông tin'}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsCustomerPickerOpen(true)}
                                className="w-full py-2 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors"
                            >
                                Đổi khách hàng
                            </button>
                        </div>

                        {/* Order Summary & Pay */}
                        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-slate-500 font-medium">Tạm tính</span>
                                <span className="text-xl font-bold text-slate-900">{formatCurrency(total)}</span>
                            </div>
                            <div className="flex justify-between items-center mb-8 pb-8 border-b border-dashed border-slate-200">
                                <span className="text-slate-900 font-bold">Tổng cộng</span>
                                <span className="text-3xl font-black text-primary">{formatCurrency(total)}</span>
                            </div>

                            <button
                                disabled={items.length === 0 || isSubmitting}
                                onClick={handleCheckout}
                                className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg shadow-sky-200 hover:bg-sky-600 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                            >
                                {isSubmitting ? (
                                    <LoadingSpinner size={24} label="" className="p-0 text-white" />
                                ) : (
                                    <>
                                        <ShoppingBag size={22} strokeWidth={2.5} />
                                        THANH TOÁN
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Floating Bottom Bar (Mobile Only) */}
                <div className="fixed lg:hidden bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 glassmorphism rounded-t-[2.5rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-50">
                    <div className="max-w-lg mx-auto flex items-center justify-between gap-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest leading-none mb-1">Tổng tiền</span>
                            <span className="text-2xl font-black text-primary leading-none">{formatCurrency(total)}</span>
                        </div>
                        <button
                            disabled={items.length === 0 || isSubmitting}
                            onClick={handleCheckout}
                            className="flex-1 h-16 bg-primary text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-sky-100 hover:bg-sky-600 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                        >
                            {isSubmitting ? (
                                <LoadingSpinner size={24} label="" className="p-0 text-white" />
                            ) : (
                                <>
                                    <ShoppingBag size={22} strokeWidth={3} />
                                    BÁN HÀNG
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Price Edit Modal */}
                <AnimatePresence>
                    {editingItemIndex !== null && (
                        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center">
                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                className="bg-white w-full max-w-md rounded-t-[2rem] sm:rounded-2xl p-6 shadow-2xl"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-black text-slate-900">Sửa giá bán</h3>
                                    <button
                                        onClick={() => setEditingItemIndex(null)}
                                        className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"
                                    >
                                        <Trash2 size={20} className="rotate-45" />
                                    </button>
                                </div>

                                <div className="mb-6">
                                    <p className="text-sm font-bold text-slate-500 mb-2">Giá mới (VNĐ)</p>
                                    <input
                                        type="number"
                                        value={editPriceValue}
                                        onChange={(e) => setEditPriceValue(e.target.value)}
                                        className="w-full text-3xl font-black text-primary border-b-2 border-primary/20 focus:border-primary outline-none py-2 bg-transparent"
                                        placeholder="0"
                                        autoFocus
                                    />
                                    <p className="text-xs text-slate-400 mt-2">Giá gốc: {formatCurrency(editingItemIndex !== null ? items[editingItemIndex].price : 0)}</p>
                                </div>

                                <button
                                    onClick={savePrice}
                                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg shadow-sky-200 active:scale-95 transition-all"
                                >
                                    Xác nhận
                                </button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <DrugPicker
                    isOpen={isPickerOpen}
                    onClose={() => setIsPickerOpen(false)}
                    onSelect={handleAddDrug}
                />

                <TemplatePicker
                    isOpen={isTemplatePickerOpen}
                    onClose={() => setIsTemplatePickerOpen(false)}
                    onSelect={handleAddTemplateItems}
                />

                {/* Customer Picker Modal */}
                {isCustomerPickerOpen && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="w-full max-w-lg bg-white rounded-3xl p-2 relative">
                            <button
                                onClick={() => setIsCustomerPickerOpen(false)}
                                className="absolute -top-12 right-0 text-white/50 hover:text-white p-2"
                            >
                                <X size={24} />
                            </button>
                            <CustomerPicker
                                forceOpen={true}
                                selectedCustomer={customer}
                                onSelect={(c) => {
                                    setCustomer(c);
                                    setIsCustomerPickerOpen(false);
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </Container>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<LoadingSpinner label="Đang khởi tạo..." className="h-screen" />}>
            <CheckoutContent />
        </Suspense>
    );
}
