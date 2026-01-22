'use client';

import { useDrugGroups } from '@/hooks/useDrugGroups';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { Drug } from '@/hooks/useDrugs';

interface DrugGroupFilterProps {
    selectedMainGroup: string | null;
    selectedSubGroup: string | null;
    onMainGroupChange: (id: string | null) => void;
    onSubGroupChange: (id: string | null) => void;
    compact?: boolean;
    drugs: Drug[];
}

export default function DrugGroupFilter({
    selectedMainGroup,
    selectedSubGroup,
    onMainGroupChange,
    onSubGroupChange,
    compact = false,
    drugs
}: DrugGroupFilterProps) {
    const { hierarchical, getChildGroups, getGroupIdsUnderParent } = useDrugGroups();
    const { parentGroups } = hierarchical;

    // Helper to check if a group has any drugs (directly or via children)
    const hasDrugs = (groupId: string) => {
        // Direct match
        if (drugs.some(d => d.group_id === groupId)) return true;

        // Check children
        const children = getChildGroups(groupId);
        if (children.length > 0) {
            const childIds = children.map(c => c.id);
            if (drugs.some(d => d.group_id && childIds.includes(d.group_id))) return true;
        }

        return false;
    };

    // Filter main groups
    const visibleParentGroups = parentGroups.filter(group => hasDrugs(group.id));

    // Get current child groups and filter them
    const allChildGroups = selectedMainGroup ? getChildGroups(selectedMainGroup) : [];
    const visibleChildGroups = allChildGroups.filter(group => hasDrugs(group.id));

    const handleMainGroupClick = (id: string | null) => {
        if (id === selectedMainGroup) {
            // Clicking same main group again - deselect
            onMainGroupChange(null);
            onSubGroupChange(null);
        } else {
            onMainGroupChange(id);
            onSubGroupChange(null); // Reset sub-group when main changes
        }
    };

    const handleSubGroupClick = (id: string | null) => {
        if (id === selectedSubGroup) {
            onSubGroupChange(null);
        } else {
            onSubGroupChange(id);
        }
    };

    // If no groups visible, don't render anything (except maybe "All" if desired)
    // But usually we want to keep "All" always visible

    return (
        <div className="space-y-2">
            {/* Main Groups Row */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                <button
                    onClick={() => handleMainGroupClick(null)}
                    className={cn(
                        "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0",
                        selectedMainGroup === null
                            ? "bg-primary text-white border-primary shadow-md"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    )}
                >
                    Tất cả
                </button>
                {visibleParentGroups.map(group => (
                    <button
                        key={group.id}
                        onClick={() => handleMainGroupClick(group.id)}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0 flex items-center gap-1",
                            selectedMainGroup === group.id
                                ? "bg-primary text-white border-primary shadow-md"
                                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        )}
                    >
                        {group.name}
                        {getChildGroups(group.id).length > 0 && (
                            <ChevronRight
                                size={12}
                                className={cn(
                                    "transition-transform",
                                    selectedMainGroup === group.id && "rotate-90"
                                )}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Sub Groups Row - Only show when main group is selected and has visible children */}
            {selectedMainGroup && visibleChildGroups.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar pl-2 border-l-2 border-primary/20">
                    <button
                        onClick={() => handleSubGroupClick(null)}
                        className={cn(
                            "px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border shrink-0",
                            selectedSubGroup === null
                                ? "bg-sky-100 text-sky-700 border-sky-200"
                                : "bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-200"
                        )}
                    >
                        Tất cả nhóm con
                    </button>
                    {visibleChildGroups.map(group => (
                        <button
                            key={group.id}
                            onClick={() => handleSubGroupClick(group.id)}
                            className={cn(
                                "px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border shrink-0",
                                selectedSubGroup === group.id
                                    ? "bg-sky-100 text-sky-700 border-sky-200"
                                    : "bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-200"
                            )}
                        >
                            {group.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
