'use client';

import Link from 'next/link';
import { Plus, Clock, ChevronRight, Pill, ClipboardList, ShoppingCart, TrendingUp } from 'lucide-react';
import { useTemplates } from '@/hooks/useTemplates';
import { useDrugs } from '@/hooks/useDrugs';
import Container from '@/components/Container';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function Home() {
    const { templates, loading: tLoading } = useTemplates();
    const { drugs, loading: dLoading } = useDrugs();

    const totalTemplates = templates.length;
    const totalDrugs = drugs.length;

    return (
        <Container className="bg-slate-50 min-h-screen">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sảnh đợi</h1>
                    <p className="text-slate-500 text-sm font-medium">Chào buổi sáng, Dược sĩ!</p>
                </div>
                <div className="h-12 w-12 overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 p-1">
                    <img
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4"
                        alt="Avatar"
                        className="rounded-xl h-full w-full object-cover"
                    />
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-sky-50 text-primary rounded-2xl">
                            <ClipboardList size={22} />
                        </div>
                        <TrendingUp size={16} className="text-green-500" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Đơn mẫu</p>
                    <p className="text-2xl font-black text-slate-900">{totalTemplates}</p>
                </div>
                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-indigo-50 text-indigo-500 rounded-2xl">
                            <Pill size={22} />
                        </div>
                        <div className="h-4 w-4 rounded-full bg-indigo-100" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kho thuốc</p>
                    <p className="text-2xl font-black text-slate-900">{totalDrugs}</p>
                </div>
            </div>

            {/* Quick Actions */}
            <section className="mb-8">
                <h2 className="text-lg font-extrabold text-slate-900 mb-4 px-1 uppercase tracking-tight">Thao tác nhanh</h2>
                <div className="grid grid-cols-2 gap-4">
                    <Link
                        href="/checkout"
                        className="flex flex-col items-center justify-center rounded-[2.5rem] bg-primary p-6 text-white shadow-xl shadow-sky-100 transition-all active:scale-95 border-4 border-white"
                    >
                        <div className="mb-3 rounded-2xl bg-white/20 p-3">
                            <ShoppingCart size={24} strokeWidth={3} />
                        </div>
                        <span className="font-bold text-sm uppercase tracking-wider">Bán lẻ</span>
                    </Link>

                    <Link
                        href="/drugs"
                        className="flex flex-col items-center justify-center rounded-[2.5rem] bg-indigo-500 p-6 text-white shadow-xl shadow-indigo-100 transition-all active:scale-95 border-4 border-white"
                    >
                        <div className="mb-3 rounded-2xl bg-white/20 p-3">
                            <Plus size={24} strokeWidth={3} />
                        </div>
                        <span className="font-bold text-sm uppercase tracking-wider">Nhập thuốc</span>
                    </Link>
                </div>
            </section>

            {/* Recent Templates */}
            <section>
                <div className="mb-4 flex items-center justify-between px-1">
                    <h2 className="text-lg font-extrabold text-slate-900 uppercase tracking-tight">Đơn mẫu mới</h2>
                    <Link href="/templates" className="text-xs font-bold text-primary hover:underline bg-sky-50 px-3 py-1.5 rounded-full">
                        Xem tất cả
                    </Link>
                </div>

                {tLoading ? (
                    <LoadingSpinner label="Đang tải dữ liệu..." className="py-10" />
                ) : (
                    <div className="space-y-3">
                        {templates.slice(0, 3).map((template, i) => (
                            <Link
                                key={template.id}
                                href={`/checkout?templateId=${template.id}`}
                                className="flex items-center justify-between rounded-[1.5rem] bg-white p-4 shadow-sm border border-slate-100 hover:border-primary transition-all active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                                        <ClipboardList size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{template.name}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{template.items?.length || 0} loại • 2h trước</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right sr-only sm:not-sr-only">
                                        <p className="text-xs font-black text-primary">
                                            {formatCurrency(template.items?.reduce((sum, it) => sum + (it.drugs?.unit_price * it.quantity), 0) || 0)}
                                        </p>
                                    </div>
                                    <ChevronRight size={20} className="text-slate-300" />
                                </div>
                            </Link>
                        ))}
                        {templates.length === 0 && !tLoading && (
                            <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-slate-100 text-slate-400 text-sm">
                                Chưa có đơn mẫu nào
                            </div>
                        )}
                    </div>
                )}
            </section>
        </Container>
    );
}
