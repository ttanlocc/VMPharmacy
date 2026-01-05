'use client';

import { useState } from 'react';
import { useDrugGroups, DrugGroup } from '@/hooks/useDrugGroups';
import { X, Pencil, Trash2, FolderPlus } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import { AnimatePresence, motion } from 'framer-motion';

export function DrugGroupManager() {
    const { groups, createGroup, updateGroup, deleteGroup, isLoading } = useDrugGroups();
    const [isOpen, setIsOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [editingGroup, setEditingGroup] = useState<DrugGroup | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGroupName.trim()) return;

        if (editingGroup) {
            await updateGroup(editingGroup.id, newGroupName);
            setEditingGroup(null);
        } else {
            await createGroup(newGroupName);
        }
        setNewGroupName('');
    };

    const startEdit = (group: DrugGroup) => {
        setEditingGroup(group);
        setNewGroupName(group.name);
    };

    const cancelEdit = () => {
        setEditingGroup(null);
        setNewGroupName('');
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
                            className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-slate-900">Quản lý nhóm thuốc</h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <form onSubmit={handleSubmit} className="flex gap-2">
                                    <input
                                        placeholder="Tên nhóm mới..."
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
                                    {editingGroup && (
                                        <button
                                            type="button"
                                            onClick={cancelEdit}
                                            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50"
                                        >
                                            <X size={20} />
                                        </button>
                                    )}
                                </form>

                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                    {groups.map((group) => (
                                        <div
                                            key={group.id}
                                            className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-slate-50/50"
                                        >
                                            <span className="font-medium text-slate-700">{group.name}</span>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => startEdit(group)}
                                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteId(group.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {groups.length === 0 && (
                                        <div className="text-center text-slate-400 py-8 text-sm">
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
                description="Bạn có chắc chắn muốn xóa nhóm thuốc này? Các thuốc trong nhóm sẽ không bị xóa mà sẽ chuyển sang trạng thái không có nhóm."
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
