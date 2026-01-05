'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import SwipeableItem from '@/components/SwipeableItem';
import { useRouter } from 'next/navigation';

interface Template {
    id: string;
    name: string;
    template_items: { count: number }[]; // simplified for count
}

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function fetchTemplates() {
            try {
                const res = await fetch('/api/templates');
                if (res.ok) {
                    const data = await res.json();
                    setTemplates(data);
                }
            } catch (error) {
                console.error('Failed to fetch templates', error);
            } finally {
                setLoading(false);
            }
        }
        fetchTemplates();
    }, []);

    return (
        <div className="p-6">
            <header className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Order Templates</h1>
                <button className="rounded-full bg-sky-50 p-2 text-sky-600 hover:bg-sky-100">
                    <Plus size={24} />
                </button>
            </header>

            {loading ? (
                <div className="text-center text-slate-500 mt-10">Loading templates...</div>
            ) : templates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <div className="mb-4 rounded-full bg-slate-100 p-6">
                        <Plus size={32} />
                    </div>
                    <p>No templates found</p>
                    <button className="mt-4 font-semibold text-sky-500">Create your first template</button>
                </div>
            ) : (
                <div className="space-y-4">
                    {templates.map((template) => (
                        <SwipeableItem
                            key={template.id}
                            onSwipeLeft={() => console.log('Delete', template.id)}
                            onSwipeRight={() => console.log('Edit', template.id)}
                        >
                            <div
                                className="flex items-center justify-between p-4"
                                onClick={() => router.push(`/checkout/${template.id}`)}
                            >
                                <div>
                                    <h3 className="font-semibold text-slate-900">{template.name}</h3>
                                    <p className="text-sm text-slate-500">
                                        {template.template_items?.length || 0} items
                                    </p>
                                </div>
                                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                    Use
                                </div>
                            </div>
                        </SwipeableItem>
                    ))}
                </div>
            )}
        </div>
    );
}
