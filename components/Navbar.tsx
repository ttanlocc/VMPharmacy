'use client';

import Link from 'next/link';
import { Home, ClipboardList, Pill, Calendar, Plus } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

const navItems = [
    { href: '/', label: 'Sảnh', icon: Home },
    { href: '/templates', label: 'Đơn mẫu', icon: ClipboardList },
    { href: '/history', label: 'Lịch sử', icon: Calendar },
    { href: '/drugs', label: 'Kho thuốc', icon: Pill },
];

export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-safe">
            <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-4">
                {navItems.slice(0, 2).map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-1 transition-colors w-16",
                                isActive ? "text-primary" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}

                <Link
                    href="/checkout"
                    className="flex items-center justify-center -mt-8"
                >
                    <div className="h-14 w-14 rounded-full bg-sky-500 shadow-lg shadow-sky-200 text-white flex items-center justify-center active:scale-95 transition-transform border-[4px] border-slate-50">
                        <Plus size={28} strokeWidth={3} />
                    </div>
                </Link>

                {navItems.slice(2).map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-1 transition-colors w-16",
                                isActive ? "text-primary" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
