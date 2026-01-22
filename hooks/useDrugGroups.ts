'use client';

import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';

export interface DrugGroup {
    id: string;
    name: string;
    parent_id: string | null;
    created_at: string;
}

export interface HierarchicalDrugGroups {
    parentGroups: DrugGroup[];
    childGroups: Map<string, DrugGroup[]>;
    allGroups: DrugGroup[];
}

export function useDrugGroups() {
    const [groups, setGroups] = useState<DrugGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchGroups = async () => {
        try {
            const response = await fetch('/api/drug-groups');
            const data = await response.json();
            setGroups(data);
        } catch (error) {
            console.error('Error fetching drug groups:', error);
            toast.error('Failed to load drug groups');
        } finally {
            setIsLoading(false);
        }
    };

    // Memoized hierarchical structure
    const hierarchical = useMemo<HierarchicalDrugGroups>(() => {
        const parentGroups = groups.filter(g => g.parent_id === null);
        const childGroups = new Map<string, DrugGroup[]>();

        parentGroups.forEach(parent => {
            const children = groups.filter(g => g.parent_id === parent.id);
            childGroups.set(parent.id, children);
        });

        return {
            parentGroups,
            childGroups,
            allGroups: groups
        };
    }, [groups]);

    // Helper to get child groups by parent ID
    const getChildGroups = (parentId: string): DrugGroup[] => {
        return hierarchical.childGroups.get(parentId) || [];
    };

    // Helper to get all group IDs under a parent (including the parent)
    const getGroupIdsUnderParent = (parentId: string): string[] => {
        const children = getChildGroups(parentId);
        return [parentId, ...children.map(c => c.id)];
    };

    const createGroup = async (name: string, parentId?: string | null) => {
        try {
            const response = await fetch('/api/drug-groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, parent_id: parentId || null }),
            });

            if (!response.ok) throw new Error('Failed to create group');

            const newGroup = await response.json();
            setGroups([newGroup, ...groups]);
            toast.success('Tạo nhóm thành công');
            return newGroup;
        } catch (error) {
            console.error('Error creating group:', error);
            toast.error('Tạo nhóm thất bại');
            throw error;
        }
    };

    const updateGroup = async (id: string, name: string, parentId?: string | null) => {
        try {
            const response = await fetch('/api/drug-groups', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, name, parent_id: parentId }),
            });

            if (!response.ok) throw new Error('Failed to update group');

            const updatedGroup = await response.json();
            setGroups(groups.map((g) => (g.id === id ? updatedGroup : g)));
            toast.success('Cập nhật nhóm thành công');
            return updatedGroup;
        } catch (error) {
            console.error('Error updating group:', error);
            toast.error('Cập nhật nhóm thất bại');
            throw error;
        }
    };

    const deleteGroup = async (id: string) => {
        try {
            const response = await fetch(`/api/drug-groups?id=${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete group');

            setGroups(groups.filter((g) => g.id !== id));
            toast.success('Xóa nhóm thành công');
        } catch (error) {
            console.error('Error deleting group:', error);
            toast.error('Xóa nhóm thất bại');
            throw error;
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    return {
        groups,
        isLoading,
        hierarchical,
        getChildGroups,
        getGroupIdsUnderParent,
        createGroup,
        updateGroup,
        deleteGroup,
        refreshGroups: fetchGroups,
    };
}
