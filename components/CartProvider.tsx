'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
    id: string; // drug_id
    drug: {
        name: string;
        unit: string;
        unit_price: number;
        image_url: string | null;
    };
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addItem: (drug: any) => void;
    removeItem: (drugId: string) => void;
    updateQuantity: (drugId: string, quantity: number) => void;
    clearCart: () => void;
    total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    // Persist cart (basic)
    useEffect(() => {
        const saved = localStorage.getItem('cart');
        if (saved) setItems(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    const addItem = (drug: any) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.id === drug.id);
            if (existing) {
                return prev.map((i) =>
                    i.id === drug.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { id: drug.id, drug, quantity: 1 }];
        });
    };

    const removeItem = (drugId: string) => {
        setItems((prev) => prev.filter((i) => i.id !== drugId));
    };

    const updateQuantity = (drugId: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(drugId);
            return;
        }
        setItems((prev) =>
            prev.map((i) => (i.id === drugId ? { ...i, quantity } : i))
        );
    };

    const clearCart = () => setItems([]);

    const total = items.reduce((sum, item) => sum + item.quantity * item.drug.unit_price, 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};
