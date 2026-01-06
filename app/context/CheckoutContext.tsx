'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Database } from '@/types/database';

type Customer = Database['public']['Tables']['customers']['Row'];

export interface CheckoutItem {
    // Shared
    name: string;
    price: number;
    quantity: number;
    note?: string;

    // Type differentiation
    type: 'drug' | 'template';

    // For Drug
    drug_id?: string;
    unit?: string;
    image?: string | null;

    // For Template
    template_id?: string;
    image_url?: string | null;
    items?: { // Flattened items content for display/processing
        drug_id: string;
        name: string;
        quantity: number;
        unit: string;
    }[];
}

interface CheckoutState {
    items: CheckoutItem[];
    customer: Customer | null;
}

interface CheckoutContextType extends CheckoutState {
    addItem: (item: CheckoutItem) => void;
    addItems: (newItems: CheckoutItem[]) => void;
    removeItem: (index: number) => void;
    updateItem: (index: number, updates: Partial<CheckoutItem>) => void;
    setCustomer: (customer: Customer | null) => void;
    clearCheckout: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

const STORAGE_KEY = 'vmp_checkout_state';

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CheckoutItem[]>([]);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setItems(parsed.items || []);
                setCustomer(parsed.customer || null);
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
            customer
        }));
    }, [items, customer, isLoaded]);

    const addItem = (newItem: CheckoutItem) => {
        setItems(prev => {
            // If it's a template, we treat it as a unique line item for now (or group if same template + same price)
            if (newItem.type === 'template') {
                const existingIndex = prev.findIndex(
                    i => i.type === 'template' && i.template_id === newItem.template_id && i.price === newItem.price
                );
                if (existingIndex >= 0) {
                    const updated = [...prev];
                    updated[existingIndex].quantity += newItem.quantity;
                    return updated;
                }
                return [...prev, newItem];
            }

            // For drugs, check for duplicate with same price
            const existingIndex = prev.findIndex(
                i => i.type === 'drug' && i.drug_id === newItem.drug_id && i.price === newItem.price
            );

            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex].quantity += newItem.quantity;
                return updated;
            }
            return [...prev, newItem];
        });
    };

    // addItems is mainly for legacy or bulk add - treating as individual adds
    const addItems = (newItems: CheckoutItem[]) => {
        newItems.forEach(item => addItem(item));
    };

    const removeItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, updates: Partial<CheckoutItem>) => {
        setItems(prev => prev.map((item, i) => i === index ? { ...item, ...updates } : item));
    };

    const clearCheckout = () => {
        setItems([]);
        setCustomer(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    if (!isLoaded) {
        return null;
    }

    return (
        <CheckoutContext.Provider value={{
            items,
            customer,
            addItem,
            addItems,
            removeItem,
            updateItem,
            setCustomer,
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
