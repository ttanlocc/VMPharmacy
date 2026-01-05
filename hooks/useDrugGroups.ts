import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export interface DrugGroup {
    id: string;
    name: string;
    created_at: string;
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

    const createGroup = async (name: string) => {
        try {
            const response = await fetch('/api/drug-groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });

            if (!response.ok) throw new Error('Failed to create group');

            const newGroup = await response.json();
            setGroups([newGroup, ...groups]);
            toast.success('Category created successfully');
            return newGroup;
        } catch (error) {
            console.error('Error creating group:', error);
            toast.error('Failed to create category');
            throw error;
        }
    };

    const updateGroup = async (id: string, name: string) => {
        try {
            const response = await fetch('/api/drug-groups', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, name }),
            });

            if (!response.ok) throw new Error('Failed to update group');

            const updatedGroup = await response.json();
            setGroups(groups.map((g) => (g.id === id ? updatedGroup : g)));
            toast.success('Category updated successfully');
            return updatedGroup;
        } catch (error) {
            console.error('Error updating group:', error);
            toast.error('Failed to update category');
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
            toast.success('Category deleted successfully');
        } catch (error) {
            console.error('Error deleting group:', error);
            toast.error('Failed to delete category');
            throw error;
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    return {
        groups,
        isLoading,
        createGroup,
        updateGroup,
        deleteGroup,
        refreshGroups: fetchGroups,
    };
}
