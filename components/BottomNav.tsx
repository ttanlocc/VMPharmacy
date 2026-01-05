'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Pill, ShoppingCart } from 'lucide-react';

export default function BottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white px-6 pb-safe pt-3 shadow-lg z-50">
            <div className="flex items-center justify-between">
                <Link href="/" className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-sky-500' : 'text-slate-400'}`}>
                    <Home size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Home</span>
                </Link>

                <Link href="/templates" className={`flex flex-col items-center gap-1 ${isActive('/templates') ? 'text-sky-500' : 'text-slate-400'}`}>
                    <FileText size={24} strokeWidth={isActive('/templates') ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Templates</span>
                </Link>

                <Link href="/checkout" className={`flex flex-col items-center gap-1 ${isActive('/checkout') ? 'text-sky-500' : 'text-slate-400'}`}>
                    <div className="relative">
                        <ShoppingCart size={24} strokeWidth={isActive('/checkout') ? 2.5 : 2} />
                        {/* Badge example */}
                        <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">2</span>
                    </div>
                    <span className="text-[10px] font-medium">Cart</span>
                </Link>

                {/* Using /drugs for Drug Management */}
                <Link href="/drugs" className={`flex flex-col items-center gap-1 ${isActive('/drugs') ? 'text-sky-500' : 'text-slate-400'}`}>
                    <Pill size={24} strokeWidth={isActive('/drugs') ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Drugs</span>
                </Link>
            </div>
        </nav>
    );
}
