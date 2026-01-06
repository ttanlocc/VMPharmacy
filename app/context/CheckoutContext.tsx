'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Database } from '@/types/database';

type Customer = Database['public']['Tables']['customers']['Row'];

export interface CheckoutItem {
    drug_id: string;
    name: string;
    unit: string;
    price: number;
    image: string | null;
    quantity: number;
    note?: string;
    source: 'template' | 'manual';
    templatePrice?: number; // The price defined in the template
}

interface CheckoutState {
    items: CheckoutItem[];
    customer: Customer | null;
    templateIds: string[];
}

interface CheckoutContextType extends CheckoutState {
    addItem: (item: CheckoutItem) => void;
    addItems: (newItems: CheckoutItem[]) => void;
    removeItem: (index: number) => void;
    updateItem: (index: number, updates: Partial<CheckoutItem>) => void;
    setCustomer: (customer: Customer | null) => void;
    addTemplateId: (id: string) => void;
    removeTemplateId: (id: string) => void; // Removes template ID and associated items? For now just ID.
    clearCheckout: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

const STORAGE_KEY = 'vmp_checkout_state';

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CheckoutItem[]>([]);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [templateIds, setTemplateIds] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setItems(parsed.items || []);
                setCustomer(parsed.customer || null);
                setTemplateIds(parsed.templateIds || []);
            }
        } catch (error) {
            console.error('Failed to load checkout state:', error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            items,
            customer,
            templateIds
        }));
    }, [items, customer, templateIds, isLoaded]);

    const addItem = (newItem: CheckoutItem) => {
        setItems(prev => {
            // Check for duplicate drug with same price
            const existingIndex = prev.findIndex(
                i => i.drug_id === newItem.drug_id && i.price === newItem.price
            );

            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex].quantity += newItem.quantity;
                return updated;
            }
            return [...prev, newItem];
        });
    };

    const addItems = (newItems: CheckoutItem[]) => {
        setItems(prev => {
            let updated = [...prev];
            newItems.forEach(newItem => {
                const existingIndex = updated.findIndex(
                    i => i.drug_id === newItem.drug_id && i.price === newItem.price
                );

                if (existingIndex >= 0) {
                    updated[existingIndex].quantity += newItem.quantity;
                } else {
                    updated.push(newItem);
                }
            });
            return updated;
        });
    };

    const removeItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, updates: Partial<CheckoutItem>) => {
        setItems(prev => prev.map((item, i) => i === index ? { ...item, ...updates } : item));
    };

    const addTemplateId = (id: string) => {
        setTemplateIds(prev => prev.includes(id) ? prev : [...prev, id]);
    };

    const removeTemplateId = (id: string) => {
        setTemplateIds(prev => prev.filter(tid => tid !== id));
    };

    const clearCheckout = () => {
        setItems([]);
        setCustomer(null);
        setTemplateIds([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    if (!isLoaded) {
        return null; // Or a loading spinner if crucial
    }

    return (
        <CheckoutContext.Provider value={{
            items,
            customer,
            templateIds,
            addItem,
            addItems,
            removeItem,
            updateItem,
            setCustomer,
            addTemplateId,
            removeTemplateId,
            clearCheckout
        }}>
            {children}
        </CheckoutContext.Provider>
    );
}

export function useCheckout() {
    const context = useContext(CheckoutContext);
    if (!context) {
        throw new Error('useCheckout must be used within a CheckoutProvider');
    }
    return context;
}
