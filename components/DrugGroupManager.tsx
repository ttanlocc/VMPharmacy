'use client';

import { useState } from 'react';
import { useDrugGroups, DrugGroup } from '@/hooks/useDrugGroups';
import { X, Pencil, Trash2, FolderPlus, ChevronDown, Plus, Check } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function DrugGroupManager() {
    const { hierarchical, createGroup, updateGroup, deleteGroup, isLoading, getChildGroups } = useDrugGroups();
    const [isOpen, setIsOpen] = useState(false);

    // Editing state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');

    // Adding state
    const [addingParentId, setAddingParentId] = useState<string | null>(null); // null = adding main group, string = adding child
    const [newName, setNewName] = useState('');
    const [isAddingMainGroup, setIsAddingMainGroup] = useState(false);

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [expandedParents, setExpandedParents] = useState<string[]>([]);

    const toggleExpand = (parentId: string) => {
        setExpandedParents(prev =>
            prev.includes(parentId)
                ? prev.filter(id => id !== parentId)
                : [...prev, parentId]
        );
    };

    // --- Editing ---
    const startEdit = (group: DrugGroup) => {
        setEditingId(group.id);
        setEditingName(group.name);
        // Cancel any add mode
        setIsAddingMainGroup(false);
        setAddingParentId(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingName('');
    };

    const saveEdit = async (group: DrugGroup) => {
        if (!editingName.trim()) return;
        await updateGroup(group.id, editingName, group.parent_id);
        cancelEdit();
    };

    // --- Adding ---
    const startAddMainGroup = () => {
        setIsAddingMainGroup(true);
        setAddingParentId(null);
        setNewName('');
        cancelEdit();
    };

    const startAddSubGroup = (parentId: string) => {
        setAddingParentId(parentId);
        setIsAddingMainGroup(false);
        setNewName('');
        cancelEdit();
        // Expand the parent
        if (!expandedParents.includes(parentId)) {
            setExpandedParents([...expandedParents, parentId]);
        }
    };

    const cancelAdd = () => {
        setIsAddingMainGroup(false);
        setAddingParentId(null);
        setNewName('');
    };

    const saveAdd = async () => {
        if (!newName.trim()) return;
        await createGroup(newName, isAddingMainGroup ? null : addingParentId);
        cancelAdd();
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
                            {/* Header */}
                            <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
                                <h3 className="text-xl font-bold text-slate-800">Quản lý nhóm thuốc</h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 text-slate-500 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
                                >
                                    <X size={22} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-5 space-y-4 overflow-y-auto flex-1">
                                {/* Add Main Group Button / Input */}
                                {isAddingMainGroup ? (
                                    <div className="flex items-center gap-2 p-3 bg-sky-50 border border-sky-200 rounded-xl">
                                        <input
                                            autoFocus
                                            placeholder="Tên nhóm chính mới..."
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && saveAdd()}
                                            className="flex-1 px-3 py-2 bg-white border border-sky-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-400 text-sm"
                                        />
                                        <button
                                            onClick={saveAdd}
                                            disabled={!newName.trim() || isLoading}
                                            className="p-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 disabled:opacity-50 transition-colors"
                                        >
                                            <Check size={18} />
                                        </button>
                                        <button
                                            onClick={cancelAdd}
                                            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={startAddMainGroup}
                                        className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-sky-400 hover:text-sky-500 hover:bg-sky-50/50 transition-all"
                                    >
                                        <Plus size={18} />
                                        <span className="font-medium">Thêm nhóm chính</span>
                                    </button>
                                )}

                                {/* Group List */}
                                <div className="space-y-3">
                                    {hierarchical.parentGroups.map((parent) => {
                                        const children = getChildGroups(parent.id);
                                        const isExpanded = expandedParents.includes(parent.id);
                                        const isEditingThis = editingId === parent.id;

                                        return (
                                            <div key={parent.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                                                {/* Parent Group Header */}
                                                <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-slate-50 to-white">
                                                    {/* Expand/Collapse Toggle */}
                                                    <button
                                                        onClick={() => toggleExpand(parent.id)}
                                                        className={cn(
                                                            "p-1.5 rounded-lg transition-colors",
                                                            children.length > 0 ? "hover:bg-slate-200 text-slate-500" : "text-slate-300 cursor-default"
                                                        )}
                                                        disabled={children.length === 0}
                                                    >
                                                        <ChevronDown
                                                            size={18}
                                                            className={cn(
                                                                "transition-transform",
                                                                isExpanded ? "rotate-0" : "-rotate-90"
                                                            )}
                                                        />
                                                    </button>

                                                    {/* Name or Edit Input */}
                                                    {isEditingThis ? (
                                                        <input
                                                            autoFocus
                                                            value={editingName}
                                                            onChange={(e) => setEditingName(e.target.value)}
                                                            onKeyDown={(e) => e.key === 'Enter' && saveEdit(parent)}
                                                            onBlur={() => saveEdit(parent)}
                                                            className="flex-1 px-3 py-1.5 border border-sky-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-400 text-sm font-semibold"
                                                        />
                                                    ) : (
                                                        <span className="flex-1 font-semibold text-slate-800">{parent.name}</span>
                                                    )}

                                                    {/* Child Count Badge */}
                                                    {children.length > 0 && (
                                                        <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                                                            {children.length}
                                                        </span>
                                                    )}

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-0.5">
                                                        <button
                                                            onClick={() => startAddSubGroup(parent.id)}
                                                            className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                                                            title="Thêm nhóm con"
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => startEdit(parent)}
                                                            className="p-2 text-sky-500 hover:bg-sky-50 rounded-lg transition-colors"
                                                            title="Sửa"
                                                        >
                                                            <Pencil size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteId(parent.id)}
                                                            className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Xóa"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Child Groups */}
                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="border-t border-slate-100 bg-slate-50/30"
                                                        >
                                                            <div className="py-2 px-3 space-y-1">
                                                                {children.map((child) => {
                                                                    const isEditingChild = editingId === child.id;
                                                                    return (
                                                                        <div
                                                                            key={child.id}
                                                                            className="flex items-center gap-2 p-2 ml-6 bg-white rounded-xl border border-slate-100"
                                                                        >
                                                                            {isEditingChild ? (
                                                                                <input
                                                                                    autoFocus
                                                                                    value={editingName}
                                                                                    onChange={(e) => setEditingName(e.target.value)}
                                                                                    onKeyDown={(e) => e.key === 'Enter' && saveEdit(child)}
                                                                                    onBlur={() => saveEdit(child)}
                                                                                    className="flex-1 px-3 py-1 border border-sky-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-400 text-sm"
                                                                                />
                                                                            ) : (
                                                                                <span className="flex-1 text-slate-700 text-sm">{child.name}</span>
                                                                            )}
                                                                            <button
                                                                                onClick={() => startEdit(child)}
                                                                                className="p-1.5 text-sky-500 hover:bg-sky-50 rounded-lg transition-colors"
                                                                            >
                                                                                <Pencil size={14} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setDeleteId(child.id)}
                                                                                className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                                                            >
                                                                                <Trash2 size={14} />
                                                                            </button>
                                                                        </div>
                                                                    );
                                                                })}

                                                                {/* Add Sub-group Input (inside parent) */}
                                                                {addingParentId === parent.id ? (
                                                                    <div className="flex items-center gap-2 p-2 ml-6 bg-emerald-50 rounded-xl border border-emerald-200">
                                                                        <input
                                                                            autoFocus
                                                                            placeholder="Tên nhóm con..."
                                                                            value={newName}
                                                                            onChange={(e) => setNewName(e.target.value)}
                                                                            onKeyDown={(e) => e.key === 'Enter' && saveAdd()}
                                                                            className="flex-1 px-3 py-1.5 bg-white border border-emerald-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
                                                                        />
                                                                        <button
                                                                            onClick={saveAdd}
                                                                            disabled={!newName.trim() || isLoading}
                                                                            className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                                                                        >
                                                                            <Check size={16} />
                                                                        </button>
                                                                        <button
                                                                            onClick={cancelAdd}
                                                                            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                                                                        >
                                                                            <X size={16} />
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => startAddSubGroup(parent.id)}
                                                                        className="flex items-center gap-1.5 ml-6 p-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                                    >
                                                                        <Plus size={14} />
                                                                        <span>Thêm nhóm con</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}

                                    {hierarchical.parentGroups.length === 0 && !isAddingMainGroup && (
                                        <div className="text-center text-slate-400 py-12 text-sm">
                                            Chưa có nhóm thuốc nào. Bấm "Thêm nhóm chính" để bắt đầu.
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
