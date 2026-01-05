'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Container from '@/components/Container';
import { User, Lock, LogOut, Shield, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };
        getUser();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        toast.success('Đã đăng xuất');
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-400">Đang tải...</div>;
    }

    return (
        <Container className="bg-slate-50 min-h-screen">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">Cài đặt</h1>

            <div className="space-y-6 max-w-2xl">
                {/* Profile Section */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <User className="text-primary" size={20} />
                        Thông tin tài khoản
                    </h2>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center text-3xl">
                            💊
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 text-lg">Dược sĩ</p>
                            <p className="text-slate-500 text-sm">{user?.email}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Email</label>
                            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500">
                                <Mail size={18} />
                                <span>{user?.email}</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Vai trò</label>
                            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500">
                                <Shield size={18} />
                                <span>Quản trị viên</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Section (Placeholder for now) */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Lock className="text-primary" size={20} />
                        Bảo mật
                    </h2>
                    <button className="w-full py-3 px-4 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors text-left flex justify-between items-center group">
                        <span>Đổi mật khẩu</span>
                        <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full py-4 bg-red-50 text-red-600 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                >
                    <LogOut size={20} />
                    Đăng xuất
                </button>

                <div className="text-center text-slate-400 text-xs font-medium py-4">
                    VMPharmacy v0.1.0 © 2026
                </div>
            </div>
        </Container>
    );
}
