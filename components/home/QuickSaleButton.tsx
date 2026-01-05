import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export default function QuickSaleButton() {
    return (
        <Link href="/checkout" className="group block mb-6">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-sky-500 to-blue-600 p-8 text-white shadow-xl shadow-sky-200 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-sky-300 active:scale-95">
                {/* Abstract Shapes/Glows */}
                <div className="absolute top-0 right-0 p-12 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 p-12 bg-sky-300/20 rounded-full blur-2xl -ml-16 -mb-16" />

                <div className="relative z-10 flex flex-col items-center justify-center gap-4">
                    <div className="rounded-3xl bg-white/20 p-5 shadow-inner ring-1 ring-white/30 backdrop-blur-md">
                        <ShoppingCart size={40} strokeWidth={2.5} />
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-1">Bán hàng nhanh</h2>
                        <p className="text-sky-100 font-medium text-sm">Tạo đơn mới ngay lập tức</p>
                    </div>
                </div>
            </div>
        </Link>
    );
}
