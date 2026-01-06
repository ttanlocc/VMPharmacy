import Link from 'next/link';
import { User, Star, ShoppingBag, UserCheck } from 'lucide-react';

export default function HomeActions() {
    return (
        <div className="grid grid-cols-2 gap-4 mb-6">
            <Link href="/checkout/new?type=guest" className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-400 to-blue-600 p-6 text-white shadow-lg shadow-sky-200 transition-all duration-300 hover:shadow-sky-300 active:scale-95">
                <div className="absolute top-0 right-0 p-8 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />

                <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="rounded-2xl bg-white/20 p-3.5 shadow-inner ring-1 ring-white/30 backdrop-blur-md">
                        <ShoppingBag size={28} strokeWidth={2.5} />
                    </div>
                    <div className="text-center">
                        <h2 className="text-lg font-black uppercase tracking-tight leading-tight">Khách Lẻ</h2>
                        <p className="text-sky-100 text-xs font-bold opacity-90 mt-0.5">Bán nhanh</p>
                    </div>
                </div>
            </Link>

            <Link href="/customers/select" className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:shadow-indigo-300 active:scale-95">
                <div className="absolute bottom-0 left-0 p-8 bg-white/10 rounded-full blur-2xl -ml-10 -mb-10" />

                <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="rounded-2xl bg-white/20 p-3.5 shadow-inner ring-1 ring-white/30 backdrop-blur-md">
                        <Star size={28} strokeWidth={2.5} />
                    </div>
                    <div className="text-center">
                        <h2 className="text-lg font-black uppercase tracking-tight leading-tight">Khách Quen</h2>
                        <p className="text-indigo-100 text-xs font-bold opacity-90 mt-0.5">Tích điểm</p>
                    </div>
                </div>
            </Link>
        </div>
    );
}
