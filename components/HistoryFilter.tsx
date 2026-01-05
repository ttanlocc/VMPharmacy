import { Search, Calendar, X } from 'lucide-react';
import { HistoryFilters } from '@/hooks/useHistory';

interface HistoryFilterProps {
    filters: HistoryFilters;
    onChange: (filters: HistoryFilters) => void;
}

export default function HistoryFilter({ filters, onChange }: HistoryFilterProps) {
    const handleChange = (key: keyof HistoryFilters, value: string) => {
        onChange({ ...filters, [key]: value || undefined });
    };

    const hasFilters = filters.search || filters.dateFrom || filters.dateTo;

    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    value={filters.search || ''}
                    onChange={(e) => handleChange('search', e.target.value)}
                    placeholder="Tìm tên khách, số điện thoại..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-sky-100 font-medium"
                />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Từ ngày</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="date"
                            value={filters.dateFrom || ''}
                            onChange={(e) => handleChange('dateFrom', e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-sky-100 text-sm font-medium"
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Đến ngày</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="date"
                            value={filters.dateTo || ''}
                            onChange={(e) => handleChange('dateTo', e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-sky-100 text-sm font-medium"
                        />
                    </div>
                </div>
            </div>

            {hasFilters && (
                <button
                    onClick={() => onChange({})}
                    className="w-full py-2 flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                >
                    <X size={16} /> Xóa bộ lọc
                </button>
            )}
        </div>
    );
}
