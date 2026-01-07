'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Database } from '@/types/database';
import { supabase } from '@/lib/supabase';

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
    saveAsTemplate: (name: string, price: number, note?: string) => Promise<any>;
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

    const saveAsTemplate = async (name: string, price: number, note?: string) => {
        try {
            // 1. Create Template
            const { data: template, error: templateError } = await (supabase
                .from('templates') as any)
                .insert({
                    name,
                    total_price: price,
                    note,
                    image_url: null // Or generate/pick one? For now null
                })
                .select()
                .single();

            if (templateError) throw templateError;

            // 2. Prepare Items
            // Flatten: Template(qty=2, items=[A(1), B(2)]) -> A(2), B(4)
            const flatItems: Record<string, number> = {}; // drug_id -> total_quantity
            const flatNotes: Record<string, string> = {}; // drug_id -> combined notes

            items.forEach(item => {
                if (item.type === 'template' && item.items) {
                    item.items.forEach(sub => {
                        const qty = sub.quantity * item.quantity;
                        flatItems[sub.drug_id] = (flatItems[sub.drug_id] || 0) + qty;
                        if (item.note) flatNotes[sub.drug_id] = [flatNotes[sub.drug_id], item.note].filter(Boolean).join('; ');
                    });
                } else if (item.drug_id) {
                    flatItems[item.drug_id] = (flatItems[item.drug_id] || 0) + item.quantity;
                    if (item.note) flatNotes[item.drug_id] = [flatNotes[item.drug_id], item.note].filter(Boolean).join('; ');
                }
            });

            const templateItems = Object.entries(flatItems).map(([drug_id, quantity]) => ({
                template_id: template.id,
                drug_id,
                quantity,
                note: flatNotes[drug_id] || ''
            }));

            // 3. Insert Items
            const { error: itemsError } = await (supabase
                .from('template_items') as any)
                .insert(templateItems);

            if (itemsError) throw itemsError;

            return template;
        } catch (error) {
            console.error('Error saving template:', error);
            throw error;
        }
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
            clearCheckout,
            saveAsTemplate
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
