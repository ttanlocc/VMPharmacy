'use client';

import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>
            <div className="pb-20 min-h-screen bg-slate-50">
                {children}
            </div>
            <BottomNav />
        </AuthGuard>
    );
}
