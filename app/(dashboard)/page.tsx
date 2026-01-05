/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { Plus, ChevronRight, Pill, ClipboardList, ShoppingCart, TrendingUp } from 'lucide-react';
import { useTemplates } from '@/hooks/useTemplates';
import { useDrugs } from '@/hooks/useDrugs';
import Container from '@/components/Container';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';

export default function Home() {
    const { templates, loading: tLoading } = useTemplates();
    const { drugs, loading: dLoading } = useDrugs();

    const totalTemplates = templates.length;
    const totalDrugs = drugs.length;

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <Container>
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sảnh đợi</h1>
                    <p className="text-slate-500 text-sm font-medium">Chào buổi sáng, Dược sĩ!</p>
                </div>
                <div className="h-12 w-12 overflow-hidden rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60 p-1 shadow-sm">
                    <img
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4"
                        alt="Avatar"
                        className="rounded-xl h-full w-full object-cover"
                    />
                </div>
            </motion.header>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <GlassCard className="p-5">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-sky-100/50 text-sky-600 rounded-2xl backdrop-blur-md">
                            <ClipboardList size={22} />
                        </div>
                        <TrendingUp size={16} className="text-emerald-500" />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Đơn mẫu</p>
                    <p className="text-3xl font-black text-slate-800">{totalTemplates}</p>
                </GlassCard>

                <GlassCard className="p-5">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-indigo-100/50 text-indigo-600 rounded-2xl backdrop-blur-md">
                            <Pill size={22} />
                        </div>
                        <div className="h-4 w-4 rounded-full bg-indigo-400 animate-pulse" />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Kho thuốc</p>
                    <p className="text-3xl font-black text-slate-800">{totalDrugs}</p>
                </GlassCard>
            </div>

            {/* Quick Actions */}
            <section className="mb-10">
                <h2 className="text-lg font-extrabold text-slate-800 mb-4 px-1 uppercase tracking-tight flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                    Thao tác nhanh
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    <Link href="/checkout" className="group">
                        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-sky-400 to-blue-600 p-6 text-white shadow-xl shadow-sky-200 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-sky-300 active:scale-95">
                            <div className="absolute top-0 right-0 p-8 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                            <div className="absolute bottom-0 left-0 p-8 bg-sky-300/20 rounded-full blur-xl -ml-10 -mb-10" />

                            <div className="relative z-10 flex flex-col items-center justify-center">
                                <div className="mb-3 rounded-2xl bg-white/20 p-3 shadow-inner ring-1 ring-white/30 backdrop-blur-sm">
                                    <ShoppingCart size={24} strokeWidth={3} />
                                </div>
                                <span className="font-bold text-sm uppercase tracking-wider">Bán lẻ</span>
                            </div>
                        </div>
                    </Link>

                    <Link href="/drugs" className="group">
                        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-xl shadow-indigo-200 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-indigo-300 active:scale-95">
                            <div className="absolute top-0 right-0 p-8 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />

                            <div className="relative z-10 flex flex-col items-center justify-center">
                                <div className="mb-3 rounded-2xl bg-white/20 p-3 shadow-inner ring-1 ring-white/30 backdrop-blur-sm">
                                    <Plus size={24} strokeWidth={3} />
                                </div>
                                <span className="font-bold text-sm uppercase tracking-wider">Nhập thuốc</span>
                            </div>
                        </div>
                    </Link>
                </div>
            </section>

            {/* Recent Templates */}
            <section>
                <div className="mb-4 flex items-center justify-between px-1">
                    <h2 className="text-lg font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        Đơn mẫu mới
                    </h2>
                    <Link href="/templates" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50/80 px-4 py-2 rounded-full backdrop-blur-sm transition-colors">
                        Xem tất cả
                    </Link>
                </div>

                {tLoading ? (
                    <LoadingSpinner label="Đang tải dữ liệu..." className="py-10" />
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="space-y-3"
                    >
                        {templates.slice(0, 3).map((template) => (
                            <motion.div key={template.id} variants={itemVariants}>
                                <Link
                                    href={`/checkout?templateId=${template.id}`}
                                >
                                    <GlassCard className="flex items-center justify-between p-4 !rounded-[1.5rem]" noHover>
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-500 font-bold border border-sky-100">
                                                <ClipboardList size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-sm mb-0.5">{template.name}</h3>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                                    {template.items?.length || 0} loại
                                                    <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                                                    2h trước
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right sr-only sm:not-sr-only">
                                                <p className="text-xs font-black text-sky-600 bg-sky-50 px-2 py-1 rounded-lg">
                                                    {formatCurrency(template.items?.reduce((sum, it) => sum + (it.drugs?.unit_price * it.quantity), 0) || 0)}
                                                </p>
                                            </div>
                                            <ChevronRight size={20} className="text-slate-300" />
                                        </div>
                                    </GlassCard>
                                </Link>
                            </motion.div>
                        ))}
                        {templates.length === 0 && !tLoading && (
                            <div className="text-center py-10 bg-white/40 backdrop-blur-sm rounded-3xl border border-dashed border-slate-200 text-slate-400 text-sm">
                                Chưa có đơn mẫu nào
                            </div>
                        )}
                    </motion.div>
                )}
            </section>
        </Container>
    );
}
