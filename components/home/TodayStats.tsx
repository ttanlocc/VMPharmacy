import { TrendingUp, ShoppingBag } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { useMemo } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { formatCurrency } from '@/lib/utils';


function isToday(date: Date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
}

export default function TodayStats() {
    const { orders, isLoading } = useOrders();

    const todayStats = useMemo(() => {
        const todayOrders = orders.filter(o => isToday(new Date(o.created_at)));
        const revenue = todayOrders.reduce((sum, o) => sum + o.total_price, 0);
        const count = todayOrders.length;
        return { revenue, count };
    }, [orders]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="h-32 rounded-[2rem] bg-slate-100 animate-pulse" />
                <div className="h-32 rounded-[2rem] bg-slate-100 animate-pulse" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-4 mb-8">
            <GlassCard className="p-5 flex flex-col justify-between" noHover>
                <div className="flex justify-between items-start mb-2">
                    <div className="p-2.5 bg-emerald-100/50 text-emerald-600 rounded-2xl backdrop-blur-md">
                        <TrendingUp size={22} />
                    </div>
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Doanh thu hôm nay</p>
                    <p className="text-2xl font-black text-slate-800 break-words">{formatCurrency(todayStats.revenue)}</p>
                </div>
            </GlassCard>

            <GlassCard className="p-5 flex flex-col justify-between" noHover>
                <div className="flex justify-between items-start mb-2">
                    <div className="p-2.5 bg-orange-100/50 text-orange-600 rounded-2xl backdrop-blur-md">
                        <ShoppingBag size={22} />
                    </div>
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Đơn đã bán</p>
                    <p className="text-2xl font-black text-slate-800">{todayStats.count}</p>
                </div>
            </GlassCard>
        </div>
    );
}
