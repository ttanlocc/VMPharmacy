'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Pill, Mail, Lock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Wait for session to be properly set in cookies
            if (data.session) {
                // Force a refresh to ensure cookies are set
                await new Promise(resolve => setTimeout(resolve, 100));
                window.location.href = '/';
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.');
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <div className="flex-1 flex flex-col justify-center px-6 py-12">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="flex justify-center mb-6">
                        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                            <Pill size={48} />
                        </div>
                    </div>
                    <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
                        Pharmacy Fast Order
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-600">
                        Dược sĩ chuyên nghiệp, phục vụ tận tâm
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100">
                        <form className="space-y-6" onSubmit={handleLogin}>
                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-start gap-3 text-sm animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle className="shrink-0 mt-0.5" size={18} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoComplete="email"
                                        className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                        placeholder="pharmacist@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Mật khẩu
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="current-password"
                                        className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={cn(
                                        "w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl shadow-sm text-base font-bold text-white bg-primary hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-[0.98]",
                                        loading && "opacity-80 cursor-not-allowed"
                                    )}
                                >
                                    {loading ? <LoadingSpinner size={20} label="" className="p-0 mr-2" /> : null}
                                    {loading ? 'Đang xác thực...' : 'Đăng nhập ngay'}
                                </button>
                            </div>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-slate-500 font-medium">Hỗ trợ kỹ thuật</span>
                                </div>
                            </div>
                            <div className="mt-4 text-center">
                                <p className="text-sm text-slate-500">
                                    Quên mật khẩu? <span className="text-primary font-bold cursor-pointer hover:underline">Liên hệ quản trị</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
