'use client';

import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';

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
            <Navbar />
        </AuthGuard>
    );
}
