import { formatCurrency } from '@/lib/utils';
import { Database } from '@/types/database';

type Drug = Database['public']['Tables']['drugs']['Row'];
type TemplateItem = Database['public']['Tables']['template_items']['Row'] & {
    drugs: Drug;
};
type Template = Database['public']['Tables']['templates']['Row'] & {
    items: TemplateItem[];
};

interface TemplateCardProps {
    template: Template;
    onClick: () => void;
}

export function TemplateCard({ template, onClick }: TemplateCardProps) {
    const totalPrice = template.items?.reduce(
        (sum, item) => sum + (item.quantity * (item.custom_price ?? item.drugs?.unit_price ?? 0)),
        0
    ) || 0;

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl border border-gray-200 p-4 active:bg-gray-50 cursor-pointer transition-colors h-full flex flex-col"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                        {template.name}
                    </h3>
                    {/* Note preview - NEW */}
                    {template.note && (
                        <p className="text-sm text-gray-500 truncate mt-0.5">
                            {template.note}
                        </p>
                    )}
                </div>
                <p className="font-bold text-primary ml-3 whitespace-nowrap">
                    {formatCurrency(totalPrice)}
                </p>
            </div>

            <div className="mt-auto">
                {/* Drug preview - compact pills */}
                <div className="flex items-center gap-2 mt-3">
                    <div className="flex -space-x-2">
                        {template.items?.slice(0, 3).map((item) => (
                            <div key={item.id} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 overflow-hidden shrink-0">
                                {item.drugs?.image_url ? (
                                    <img
                                        src={item.drugs.image_url}
                                        alt={item.drugs.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-slate-400">Rx</div>
                                )}
                            </div>
                        ))}
                    </div>
                    <span className="text-sm text-gray-500">
                        {template.items?.length || 0} thuốc
                    </span>
                </div>
            </div>
        </div>
    );
}
