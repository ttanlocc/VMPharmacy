'use client';

import Link from 'next/link';
import { Plus, Clock, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();

    return (
        <div className="p-6">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Pharmacy</h1>
                    <p className="text-slate-500">Good Morning, Pharmacist</p>
                </div>
                <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-200">
                    {/* Avatar placeholder */}
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" />
                </div>
            </header>

            {/* Quick Actions */}
            <section className="mb-8">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-4">
                    <Link href="/templates" className="flex flex-col items-center justify-center rounded-2xl bg-sky-500 p-6 text-white shadow-lg shadow-sky-200 transition-transform active:scale-95">
                        <div className="mb-3 rounded-full bg-white/20 p-3">
                            <Plus size={24} />
                        </div>
                        <span className="font-semibold">New Order</span>
                    </Link>

                    <button className="flex flex-col items-center justify-center rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-transform active:scale-95">
                        <div className="mb-3 rounded-full bg-slate-100 p-3 text-slate-600">
                            <Clock size={24} />
                        </div>
                        <span className="font-semibold text-slate-700">History</span>
                    </button>
                </div>
            </section>

            {/* Recent Templates */}
            <section>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">Recent Templates</h2>
                    <Link href="/templates" className="text-sm font-medium text-sky-500 hover:text-sky-600">
                        View All
                    </Link>
                </div>

                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm border border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
                                    <span className="font-bold text-lg">Rx</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">Flu Season Kit</h3>
                                    <p className="text-xs text-slate-500">5 items • Last used 2h ago</p>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-slate-300" />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
