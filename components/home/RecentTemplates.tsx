import Link from 'next/link';
import { ChevronRight, ClipboardList } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import { useTemplates } from '@/hooks/useTemplates';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatCurrency } from '@/lib/utils';
import { Database } from '@/types/database';

type Template = Database['public']['Tables']['templates']['Row'] & {
    items: (Database['public']['Tables']['template_items']['Row'] & {
        drugs: Database['public']['Tables']['drugs']['Row']
    })[]
};

export default function RecentTemplates() {
    const { templates, loading } = useTemplates();

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (loading) return <LoadingSpinner label="Đang tải mẫu đơn..." className="py-10" />;

    return (
        <section>
            <div className="mb-4 flex items-center justify-between px-1">
                <h2 className="text-lg font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Đơn mẫu phổ biến
                </h2>
                <Link href="/templates" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50/80 px-4 py-2 rounded-full backdrop-blur-sm transition-colors">
                    Xem tất cả
                </Link>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
            >
                {templates.slice(0, 4).map((template: any) => ( // using any to bypass strict type complexity for now or we can type properly
                    <motion.div key={template.id} variants={itemVariants}>
                        <Link href={`/checkout?templateId=${template.id}`}>
                            <GlassCard className="h-full p-4 flex flex-col justify-between !rounded-[1.5rem]" hoverScale>
                                <div className="mb-3">
                                    <div className="flex -space-x-3 mb-3 overflow-hidden">
                                        {template.items?.slice(0, 3).map((item: any, idx: number) => (
                                            <div key={idx} className="h-10 w-10 rounded-full border-2 border-white bg-slate-100 overflow-hidden">
                                                {item.drugs?.image_url ? (
                                                    <img src={item.drugs.image_url} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center bg-slate-200 text-slate-400 text-[10px] font-bold">
                                                        Rx
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {(template.items?.length || 0) > 3 && (
                                            <div className="h-10 w-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                +{template.items.length - 3}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-sm line-clamp-2 leading-tight">{template.name}</h3>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs font-bold text-slate-500">
                                        {template.items?.length || 0} thuốc
                                    </span>
                                    <span className="text-xs font-black text-sky-600 bg-sky-50 px-2 py-1 rounded-lg">
                                        {formatCurrency(template.items?.reduce((sum: number, it: any) => sum + ((it.custom_price ?? it.drugs?.unit_price ?? 0) * it.quantity), 0) || 0)}
                                    </span>
                                </div>
                            </GlassCard>
                        </Link>
                    </motion.div>
                ))}
                {templates.length === 0 && (
                    <div className="col-span-2 text-center py-10 bg-white/40 backdrop-blur-sm rounded-3xl border border-dashed border-slate-200 text-slate-400 text-sm">
                        Chưa có đơn mẫu nào
                    </div>
                )}
            </motion.div>
        </section>
    );
}
