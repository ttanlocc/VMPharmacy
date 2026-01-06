'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTemplates } from '@/hooks/useTemplates';
import { useCheckout } from '@/app/context/CheckoutContext';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import Container from '@/components/Container';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import { ClipboardList, Plus, ArrowLeft, Pill, User } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';

type Customer = Database['public']['Tables']['customers']['Row'];

function TemplateSelectionContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const customerId = searchParams.get('customerId');
    const type = searchParams.get('type');

    const { templates, loading: templatesLoading } = useTemplates();
    const { clearCheckout, setCustomer, addItems, addTemplateId } = useCheckout();

    const [customer, setCustomerData] = useState<Customer | null>(null);
    const [loadingCustomer, setLoadingCustomer] = useState(false);

    useEffect(() => {
        const fetchCustomer = async () => {
            if (!customerId) return;
            setLoadingCustomer(true);
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .eq('id', customerId)
                .single();

            if (data) {
                setCustomerData(data);
            }
            setLoadingCustomer(false);
        };

        fetchCustomer();
    }, [customerId]);

    const titleStart = type === 'guest' ? 'Khách Lẻ' : (customer ? customer.name : 'Khách hàng');
    const subtitle = type === 'guest' ? 'Bán nhanh cho khách vãng lai' : (customer ? `SĐT: ${customer.phone}` : 'Đang tải thông tin...');

    const handleSelectEmpty = () => {
        clearCheckout();
        if (customer) setCustomer(customer);
        router.push('/checkout');
    };

    const handleSelectTemplate = (template: any) => {
        clearCheckout();
        if (customer) setCustomer(customer);

        // Transform template items to CheckoutItems
        const checkoutItems = (template.items || []).map((item: any) => ({
            drug_id: item.drug_id,
            name: item.drugs?.name || '',
            unit: item.drugs?.unit || '',
            price: item.custom_price || item.drugs?.unit_price || 0,
            image: item.drugs?.image_url || null,
            quantity: item.quantity,
            note: item.note,
            source: 'template' as const,
            templatePrice: item.custom_price || undefined
        }));

        addItems(checkoutItems);
        addTemplateId(template.id);
        router.push('/checkout');
    };

    if (loadingCustomer && customerId) {
        return <LoadingSpinner label="Đang tải thông tin khách hàng..." className="h-screen" />;
    }

    return (
        <Container>
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.back()}
                    className="p-3 bg-white shadow-sm border border-slate-100 rounded-2xl text-slate-600 active:scale-90 transition-transform"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Chọn đơn cho</span>
                        {type === 'guest' && <span className="px-2 py-0.5 bg-sky-100 text-sky-600 rounded text-xs font-bold uppercase">Khách lẻ</span>}
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{titleStart}</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Empty Order Card - ALWAYS FIRST */}
                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSelectEmpty}
                    className="group"
                >
                    <div className="h-full bg-white border-2 border-dashed border-slate-300 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center hover:border-sky-400 hover:bg-sky-50 transition-all min-h-[200px]">
                        <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-sky-100 text-slate-400 group-hover:text-sky-500 transition-colors">
                            <Plus size={32} />
                        </div>
                        <h3 className="text-xl font-black text-slate-700 group-hover:text-sky-600 transition-colors">Đơn Trống</h3>
                        <p className="text-slate-400 font-medium text-sm mt-1">Tạo đơn mới hoàn toàn</p>
                    </div>
                </motion.button>

                {templatesLoading ? (
                    <div className="col-span-full py-10 flex justify-center">
                        <LoadingSpinner />
                    </div>
                ) : (
                    templates.map((template, idx) => {
                        const total = template.items?.reduce((sum, item) => sum + ((item.custom_price || item.drugs?.unit_price || 0) * item.quantity), 0) || 0;
                        const drugCount = template.items?.length || 0;

                        return (
                            <motion.button
                                key={template.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSelectTemplate(template)}
                                className="text-left h-full"
                            >
                                <GlassCard className="h-full !p-5 flex flex-col justify-between" noHover>
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-indigo-50 text-indigo-500 rounded-2xl">
                                                <ClipboardList size={22} />
                                            </div>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest bg-slate-100/50 px-2 py-1 rounded-lg">
                                                {drugCount} loại
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-extrabold text-slate-800 mb-2 line-clamp-2">{template.name}</h3>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-slate-100/50 flex justify-between items-end">
                                        <div className="flex -space-x-2">
                                            {template.items?.slice(0, 3).map((item, i) => (
                                                <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 overflow-hidden shadow-sm">
                                                    {item.drugs?.image_url ? (
                                                        <img src={item.drugs.image_url} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center bg-slate-50">
                                                            <Pill size={12} className="text-slate-300" />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {(template.items?.length || 0) > 3 && (
                                                <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm">
                                                    +{(template.items?.length || 0) - 3}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                            {formatCurrency(total)}
                                        </p>
                                    </div>
                                </GlassCard>
                            </motion.button>
                        );
                    })
                )}
            </div>
        </Container>
    );
}

export default function TemplateSelectionPage() {
    return (
        <Suspense fallback={<LoadingSpinner className="h-screen" />}>
            <TemplateSelectionContent />
        </Suspense>
    );
}
