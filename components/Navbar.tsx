'use client';

import Link from 'next/link';
import { Home, ClipboardList, Pill, Settings, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

const navItems = [
    { href: '/', label: 'Sảnh', icon: Home },
    { href: '/templates', label: 'Đơn mẫu', icon: ClipboardList },
    { href: '/drugs', label: 'Kho thuốc', icon: Pill },
    { href: '/settings', label: 'Cài đặt', icon: Settings },
];

export default function Navbar() {
    const pathname = usePathname();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-safe">
            <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-1 transition-colors",
                                isActive ? "text-primary" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
                <button
                    onClick={handleLogout}
                    className="flex flex-col items-center gap-1 text-slate-400 hover:text-red-500 transition-colors"
                >
                    <LogOut size={22} />
                    <span className="text-[10px] font-medium">Thoát</span>
                </button>
            </div>
        </nav>
    );
}
