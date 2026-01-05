'use client';

import { useCart } from '@/components/CartProvider';
import SwipeableItem from '@/components/SwipeableItem';
import PriceEditor from '@/components/PriceEditor';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';

export default function CheckoutPage() {
    const { items, updateQuantity, removeItem, total, clearCart } = useCart();
    const router = useRouter();

    const handlePlaceOrder = async () => {
        // API call placeholder
        // await fetch('/api/orders', { method: 'POST', body: JSON.stringify({ items }) });
        alert('Order placed successfully!');
        clearCart();
        router.push('/');
    };

    // We need to handle client-side rendering for cart items to avoid hydration mismatch
    // but for simplicity in this artifact, we assume AuthGuard handles loading or we add a check.
    // Actually, useCart items init empty so no mismatch usually if localStorage read in useEffect.

    return (
        <AuthGuard>
            <div className="flex min-h-screen flex-col bg-slate-50 pb-safe">
                <header className="sticky top-0 z-10 flex items-center gap-4 bg-white p-4 shadow-sm">
                    <Link href="/" className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-xl font-bold text-slate-900">Checkout</h1>
                </header>

                <div className="flex-1 overflow-y-auto p-4">
                    {items.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-slate-400">
                            <p>Your cart is empty</p>
                            <Link href="/drugs" className="mt-4 font-semibold text-sky-500">Add items</Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => (
                                <SwipeableItem
                                    key={item.id}
                                    onSwipeLeft={() => removeItem(item.id)}
                                    className="bg-white"
                                >
                                    <div className="flex items-center gap-4 p-4">
                                        {/* Image */}
                                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                                            {item.drug.image_url && (
                                                <img src={item.drug.image_url} alt={item.drug.name} className="h-full w-full object-cover" />
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-slate-900">{item.drug.name}</h3>
                                            <p className="text-sm text-slate-500">{new Intl.NumberFormat('vi-VN').format(item.drug.unit_price)} / {item.drug.unit}</p>
                                        </div>

                                        {/* Editor */}
                                        <PriceEditor
                                            value={item.quantity}
                                            onChange={(val) => updateQuantity(item.id, val)}
                                        />
                                    </div>
                                </SwipeableItem>
                            ))}
                        </div>
                    )}
                </div>

                {items.length > 0 && (
                    <div className="bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                        <div className="mb-4 flex items-center justify-between text-lg font-bold">
                            <span>Total</span>
                            <span className="text-sky-600">{new Intl.NumberFormat('vi-VN').format(total)}</span>
                        </div>
                        <button
                            onClick={handlePlaceOrder}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 py-4 font-bold text-white shadow-lg shadow-sky-200 transition-transform active:scale-95"
                        >
                            <span>Place Order</span>
                            <CheckCircle size={20} />
                        </button>
                    </div>
                )}
            </div>
        </AuthGuard>
    );
}
