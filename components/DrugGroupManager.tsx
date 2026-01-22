'use client';

import { useState } from 'react';
import { useDrugGroups, DrugGroup } from '@/hooks/useDrugGroups';
import { X, Pencil, Trash2, FolderPlus, ChevronRight, Plus } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function DrugGroupManager() {
    const { hierarchical, createGroup, updateGroup, deleteGroup, isLoading, getChildGroups } = useDrugGroups();
    const [isOpen, setIsOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
    const [editingGroup, setEditingGroup] = useState<DrugGroup | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [expandedParents, setExpandedParents] = useState<string[]>([]);

    const toggleExpand = (parentId: string) => {
        setExpandedParents(prev =>
            prev.includes(parentId)
                ? prev.filter(id => id !== parentId)
                : [...prev, parentId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGroupName.trim()) return;

        if (editingGroup) {
            await updateGroup(editingGroup.id, newGroupName, editingGroup.parent_id);
            setEditingGroup(null);
        } else {
            await createGroup(newGroupName, selectedParentId);
        }
        setNewGroupName('');
        setSelectedParentId(null);
    };

    const startEdit = (group: DrugGroup) => {
        setEditingGroup(group);
        setNewGroupName(group.name);
        setSelectedParentId(group.parent_id);
    };

    const cancelEdit = () => {
        setEditingGroup(null);
        setNewGroupName('');
        setSelectedParentId(null);
    };

    const startAddSubGroup = (parentId: string) => {
        setSelectedParentId(parentId);
        setEditingGroup(null);
        setNewGroupName('');
        // Expand the parent if not already
        if (!expandedParents.includes(parentId)) {
            setExpandedParents([...expandedParents, parentId]);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-2xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
                <FolderPlus size={18} />
                <span>Quản lý nhóm</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
                        >
                            <div className="p-6 border-b border-slate-50 flex justify-between items-center shrink-0">
                                <h3 className="text-xl font-bold text-slate-900">Quản lý nhóm thuốc</h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 text-slate-700 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-6 space-y-6 overflow-y-auto flex-1">
                                {/* Add/Edit Form */}
                                <form onSubmit={handleSubmit} className="space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            placeholder={selectedParentId ? "Tên nhóm con..." : "Tên nhóm chính..."}
                                            value={newGroupName}
                                            onChange={(e) => setNewGroupName(e.target.value)}
                                            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newGroupName.trim() || isLoading}
                                            className="px-4 py-2 bg-primary text-white font-medium rounded-xl hover:bg-sky-600 disabled:opacity-50 transition-colors whitespace-nowrap"
                                        >
                                            {editingGroup ? 'Sửa' : 'Thêm'}
                                        </button>
                                        {(editingGroup || selectedParentId) && (
                                            <button
                                                type="button"
                                                onClick={cancelEdit}
                                                className="p-2 text-slate-700 hover:text-slate-600 rounded-xl hover:bg-slate-50"
                                            >
                                                <X size={20} />
                                            </button>
                                        )}
                                    </div>

                                    {selectedParentId && !editingGroup && (
                                        <div className="text-xs text-sky-600 bg-sky-50 px-3 py-2 rounded-lg">
                                            Đang thêm nhóm con cho: <strong>{hierarchical.parentGroups.find(g => g.id === selectedParentId)?.name}</strong>
                                        </div>
                                    )}
                                </form>

                                {/* Hierarchical Group List */}
                                <div className="space-y-2">
                                    {hierarchical.parentGroups.map((parent) => {
                                        const children = getChildGroups(parent.id);
                                        const isExpanded = expandedParents.includes(parent.id);

                                        return (
                                            <div key={parent.id} className="border border-slate-100 rounded-xl overflow-hidden">
                                                {/* Parent Group */}
                                                <div className="flex items-center justify-between p-3 bg-slate-50/50">
                                                    <div
                                                        className="flex items-center gap-2 flex-1 cursor-pointer"
                                                        onClick={() => children.length > 0 && toggleExpand(parent.id)}
                                                    >
                                                        {children.length > 0 && (
                                                            <ChevronRight
                                                                size={16}
                                                                className={cn(
                                                                    "text-slate-400 transition-transform",
                                                                    isExpanded && "rotate-90"
                                                                )}
                                                            />
                                                        )}
                                                        <span className="font-bold text-slate-800">{parent.name}</span>
                                                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                                            {children.length} nhóm con
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => startAddSubGroup(parent.id)}
                                                            className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Thêm nhóm con"
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => startEdit(parent)}
                                                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                        >
                                                            <Pencil size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteId(parent.id)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Child Groups */}
                                                <AnimatePresence>
                                                    {isExpanded && children.length > 0 && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="border-t border-slate-100"
                                                        >
                                                            {children.map((child) => (
                                                                <div
                                                                    key={child.id}
                                                                    className="flex items-center justify-between p-3 pl-10 bg-white border-b border-slate-50 last:border-0"
                                                                >
                                                                    <span className="font-medium text-slate-700">{child.name}</span>
                                                                    <div className="flex gap-1">
                                                                        <button
                                                                            onClick={() => startEdit(child)}
                                                                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                                        >
                                                                            <Pencil size={14} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setDeleteId(child.id)}
                                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                        >
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}

                                    {hierarchical.parentGroups.length === 0 && (
                                        <div className="text-center text-slate-700 py-8 text-sm">
                                            Chưa có nhóm thuốc nào.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                title="Xóa nhóm thuốc?"
                description="Bạn có chắc chắn muốn xóa nhóm thuốc này? Các thuốc trong nhóm sẽ không bị xóa mà sẽ chuyển sang trạng thái không có nhóm. Các nhóm con cũng sẽ chuyển thành nhóm chính."
                onConfirm={async () => {
                    if (deleteId) {
                        await deleteGroup(deleteId);
                        setDeleteId(null);
                    }
                }}
            />
        </>
    );
}
