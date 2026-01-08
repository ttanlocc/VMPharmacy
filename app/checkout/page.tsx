/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, ShoppingBag, Trash2, CheckCircle2, FileText, User, X, Save, ClipboardList } from 'lucide-react';
import Container from '@/components/Container';
import AddItemModal from '@/components/AddItemModal';
import CustomerPicker from '@/components/CustomerPicker';
import LoadingSpinner from '@/components/LoadingSpinner';
import CheckoutLineItem from '@/components/CheckoutLineItem';
import SaveTemplateModal from '@/components/SaveTemplateModal';
import { formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrders } from '@/hooks/useOrders';
import { useCheckout, CheckoutItem } from '@/app/context/CheckoutContext';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';

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
        clearCheckout,
        saveAsTemplate
    } = useCheckout();

    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    const [addItemInitialTab, setAddItemInitialTab] = useState<'drug' | 'template'>('drug');
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

    const [isSuccess, setIsSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCustomerPickerOpen, setIsCustomerPickerOpen] = useState(false);
    const [activeTemplate, setActiveTemplate] = useState<{ name: string; note: string | null } | null>(null);

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
                    const { data: templateData } = await supabase
                        .from('templates')
                        .select('name, note')
                        .eq('id', templateIdParam)
                        .single();

                    if (templateData) {
                        setActiveTemplate(templateData);
                    }

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
            const flattenedItems = items.flatMap(item => {
                if (item.type === 'template' && item.items) {
                    return item.items.map(subItem => ({
                        drug_id: subItem.drug_id,
                        quantity: subItem.quantity * item.quantity,
                        note: '',
                    }));
                } else {
                    return [{
                        drug_id: item.drug_id,
                        quantity: item.quantity,
                        note: item.note,
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
            toast.error('Có lỗi xảy ra khi tạo đơn hàng');
        } finally {
            setIsSubmitting(false);
        }
    };



    const handleSaveTemplate = async (name: string, price: number, note?: string) => {
        try {
            await saveAsTemplate(name, price, note);
            toast.success('Đã lưu đơn mẫu thành công!');
        } catch (error) {
            console.error(error);
            toast.error('Lưu đơn mẫu thất bại');
        }
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
        <Container className="bg-slate-50 min-h-screen pb-32 lg:pb-0">
            <div className="flex flex-col gap-6">
                {/* Header with Customer Info */}
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-3 bg-white shadow-sm border border-slate-100 rounded-2xl text-slate-600 active:scale-90 transition-transform">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Thanh toán</h1>
                        <div className="flex items-center gap-2 mt-1">
                            {customer ? (
                                <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
                                    <User size={14} className="fill-indigo-700" />
                                    <span className="text-sm font-bold">{customer.name}</span>
                                </div>
                            ) : activeTemplate ? (
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2 px-3 py-1 bg-sky-50 text-sky-700 rounded-lg w-fit">
                                        <FileText size={14} className="fill-sky-700" />
                                        <span className="text-sm font-bold">{activeTemplate.name}</span>
                                    </div>
                                    {activeTemplate.note && (
                                        <p className="text-xs text-amber-600 font-bold mt-1 flex items-center gap-1">
                                            ⚠️ {activeTemplate.note}
                                        </p>
                                    )}
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
                                    <CheckoutLineItem
                                        item={item}
                                        index={index}
                                        onDelete={() => removeItem(index)}
                                        onEdit={() => openPriceEditor(index)}
                                        onUpdateQuantity={(delta) => handleUpdateQuantity(index, delta)}
                                        showHint={index === 0}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {items.length === 0 && (
                            <div className="py-20 text-center text-slate-300 font-medium border-2 border-dashed border-slate-100 rounded-3xl">
                                Chưa có thuốc nào trong giỏ
                            </div>
                        )}

                        {/* Action Row - COMPACT GRID */}
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => {
                                    setAddItemInitialTab('drug');
                                    setIsAddItemModalOpen(true);
                                }}
                                className="w-full py-3 bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-700 font-bold shadow-sm hover:bg-slate-50 active:scale-95 transition-all"
                            >
                                <Plus size={20} className="text-primary" />
                                <span className="text-xs">Thêm thuốc</span>
                            </button>
                            <button
                                onClick={() => {
                                    setAddItemInitialTab('template');
                                    setIsAddItemModalOpen(true);
                                }}
                                className="w-full py-3 bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-700 font-bold shadow-sm hover:bg-slate-50 active:scale-95 transition-all"
                            >
                                <ClipboardList size={20} className="text-blue-500" />
                                <span className="text-xs">Đơn mẫu</span>
                            </button>
                            <button
                                disabled={items.length === 0}
                                onClick={() => setIsSaveModalOpen(true)}
                                className="w-full py-3 bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-700 font-bold shadow-sm hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                            >
                                <Save size={20} className="text-indigo-500" />
                                <span className="text-xs">Lưu mẫu</span>
                            </button>
                        </div>
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

                {/* Floating Bottom Bar (Mobile Only) - Integrated with Bottom Sheet style */}
                <div className="fixed lg:hidden bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 glassmorphism rounded-t-[2rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-40 pb-safe">
                    <div className="flex items-center gap-4 mb-3 px-2">
                        <div className="flex flex-col flex-1">
                            <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest leading-none mb-1">Tổng cộng ({items.length} món)</span>
                            <span className="text-2xl font-black text-primary leading-none truncate">{formatCurrency(total)}</span>
                        </div>
                        {customer && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg max-w-[120px]">
                                <User size={14} className="fill-indigo-700 shrink-0" />
                                <span className="text-xs font-bold truncate">{customer.name}</span>
                            </div>
                        )}
                    </div>
                    <button
                        disabled={items.length === 0 || isSubmitting}
                        onClick={handleCheckout}
                        className="w-full h-14 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-sky-100 hover:bg-sky-600 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
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
                                    <Input
                                        type="number"
                                        value={editPriceValue}
                                        onChange={(e) => setEditPriceValue(e.target.value)}
                                        className="text-3xl font-black text-primary border-b-2 border-primary/20 focus:border-primary outline-none py-2 bg-transparent"
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

                <AddItemModal
                    isOpen={isAddItemModalOpen}
                    onClose={() => setIsAddItemModalOpen(false)}
                    initialTab={addItemInitialTab}
                />

                <SaveTemplateModal
                    isOpen={isSaveModalOpen}
                    onClose={() => setIsSaveModalOpen(false)}
                    onSave={handleSaveTemplate}
                    items={items}
                    total={total}
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
