/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Plus, ShoppingBag, Trash2, Edit3, Pill, CheckCircle2, FileText } from 'lucide-react';
import Container from '@/components/Container';
import SwipeableItem from '@/components/SwipeableItem';
import DrugPicker from '@/components/DrugPicker';
import CustomerPicker from '@/components/CustomerPicker';
import TemplatePicker from '@/components/TemplatePicker';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrders } from '@/hooks/useOrders';
import { Database } from '@/types/database';

type Customer = Database['public']['Tables']['customers']['Row'];

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const templateId = searchParams.get('templateId');
    const { createOrder } = useOrders();

    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Price Edit Modal State
    const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
    const [editPriceValue, setEditPriceValue] = useState<string>('');

    useEffect(() => {
        if (templateId) {
            loadTemplate(templateId);
        }
    }, [templateId]);

    const loadTemplate = async (id: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('template_items')
                .select('*, drugs(*)')
                .eq('template_id', id);

            if (error) throw error;

            const formattedItems = ((data as any) || []).map((item: any) => ({
                id: item.id,
                drug_id: item.drug_id,
                name: item.drugs?.name || '',
                unit: item.drugs?.unit || '',
                price: item.custom_price || item.drugs?.unit_price || 0,
                image: item.drugs?.image_url || null,
                quantity: item.quantity,
                note: item.note
            }));

            setItems(formattedItems);
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Không thể tải đơn mẫu');
        } finally {
            setLoading(false);
        }
    };

    const handleAddDrug = (drug: any) => {
        setItems([...items, {
            drug_id: drug.id,
            name: drug.name,
            unit: drug.unit,
            price: drug.unit_price,
            image: drug.image_url,
            quantity: 1,
            note: ''
        }]);
    };

    const handleUpdateQuantity = (index: number, delta: number) => {
        setItems(items.map((item, i) =>
            i === index ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
        ));
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const openPriceEditor = (index: number) => {
        setEditingItemIndex(index);
        setEditPriceValue(items[index].price.toString());
    };

    const savePrice = () => {
        if (editingItemIndex !== null) {
            const newPrice = parseFloat(editPriceValue);
            if (!isNaN(newPrice) && newPrice >= 0) {
                setItems(items.map((item, i) =>
                    i === editingItemIndex ? { ...item, price: newPrice } : item
                ));
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
            // Pass templateId if we are using a template (searchParams)
            // Note: If we just added items from template picker, it's not strictly 'from a template' layout, 
            // but the requirement is flexible. Let's use the one from URL if available.
            // Or if user wants to track specific template, we need to store it. 
            // For now, use URL param as primary source for 'Order from Template'.
            const currentTemplateId = templateId || null;

            await createOrder(items, total, selectedCustomer?.id, currentTemplateId);
            setIsSuccess(true);
            setTimeout(() => {
                router.push('/');
            }, 2500);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddTemplateItems = (newItems: any[]) => {
        // When adding form picker, we also need to respect custom_price if picker provides it (it likely does if it queries API)
        // Assuming newItems comes with correct structure.
        setItems(prev => [...prev, ...newItems]);
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
                {/* Customer Picker */}
                <CustomerPicker
                    selectedCustomer={selectedCustomer}
                    onSelect={setSelectedCustomer}
                />

                {/* Header */}
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-3 bg-white shadow-sm border border-slate-100 rounded-2xl text-slate-600 active:scale-90 transition-transform">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Thanh toán</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{items.length} món trong giỏ</p>
                    </div>
                </div>

                {/* List */}
                {loading ? (
                    <LoadingSpinner label="Đang chuẩn bị đơn hàng..." className="mt-20" />
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence mode="popLayout">
                            {items.map((item, index) => (
                                <motion.div
                                    key={`${item.drug_id}-${index}`}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                >
                                    <SwipeableItem
                                        onDelete={() => handleRemoveItem(index)}
                                        onEdit={() => openPriceEditor(index)}
                                        className="rounded-2xl"
                                    >
                                        <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl">
                                            <div className="h-14 w-14 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                                                {item.image ? (
                                                    <img src={item.image} className="h-full w-full object-cover" />
                                                ) : (
                                                    <Pill size={20} className="text-slate-300" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-slate-800 text-sm">{item.name}</h3>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <p className="text-xs font-bold text-primary">{formatCurrency(item.price)}</p>
                                                    <span className="text-xs text-slate-400">/ {item.unit}</span>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); openPriceEditor(index); }}
                                                        className="p-1 text-slate-300 hover:text-sky-500 transition-colors"
                                                    >
                                                        <Edit3 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="flex items-center bg-slate-50 rounded-xl border border-slate-100 px-1 py-1">
                                                    <button
                                                        onClick={() => handleUpdateQuantity(index, -1)}
                                                        className="w-8 h-8 flex items-center justify-center font-bold text-slate-400 hover:text-slate-600"
                                                    >-</button>
                                                    <span className="w-8 text-center font-black text-sm text-slate-900">{item.quantity}</span>
                                                    <button
                                                        onClick={() => handleUpdateQuantity(index, 1)}
                                                        className="w-8 h-8 flex items-center justify-center font-bold text-slate-400 hover:text-slate-600"
                                                    >+</button>
                                                </div>
                                                <span className="text-sm font-black text-slate-900">{formatCurrency(item.price * item.quantity)}</span>
                                            </div>
                                        </div>
                                    </SwipeableItem>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setIsPickerOpen(true)}
                                className="py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-400 font-bold hover:bg-white hover:border-primary hover:text-primary transition-all active:scale-[0.98]"
                            >
                                <Plus size={20} /> Thêm thuốc
                            </button>
                            <button
                                onClick={() => setIsTemplatePickerOpen(true)}
                                className="py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-400 font-bold hover:bg-white hover:border-sky-500 hover:text-sky-500 transition-all active:scale-[0.98]"
                            >
                                <FileText size={20} /> Đơn mẫu
                            </button>
                        </div>
                    </div>
                )}


                <div className="h-40" /> {/* Spacer */}
            </div>

            {/* Floating Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 glassmorphism rounded-t-[2.5rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-50">
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
                                    <Trash2 size={20} className="rotate-45" /> {/* Use rotate to simulate close X if needed, or import X */}
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
                                <p className="text-xs text-slate-400 mt-2">Giá gốc: {formatCurrency(editingItemIndex !== null ? items[editingItemIndex].drug_id ? items[editingItemIndex].price : 0 : 0)}</p>
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
