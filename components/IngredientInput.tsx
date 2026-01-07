'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { X } from 'lucide-react';

interface IngredientInputProps {
    value: string;
    onChange: (value: string) => void;
}

export default function IngredientInput({ value, onChange }: IngredientInputProps) {
    const [suggestions, setSuggestions] = useState<{ id: string; name: string }[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Close suggestions when clicking outside
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = async (query: string) => {
        onChange(query);
        if (!query) {
            setSuggestions([]);
            return;
        }

        const { data } = await supabase
            .from('ingredients')
            .select('id, name')
            .ilike('name', `%${query}%`)
            .limit(5);

        if (data) {
            setSuggestions(data);
            setShowSuggestions(true);
        }
    };

    const handleSelect = (name: string) => {
        onChange(name);
        setShowSuggestions(false);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <div className="relative">
                <Input
                    value={value}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="VD: Paracetamol"
                    onFocus={() => {
                        if (value && suggestions.length > 0) setShowSuggestions(true);
                    }}
                />
                {value && (
                    <button
                        type="button"
                        onClick={() => {
                            onChange('');
                            setSuggestions([]);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((suggestion) => (
                        <button
                            key={suggestion.id}
                            type="button"
                            onClick={() => handleSelect(suggestion.name)}
                            className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-50 last:border-0 font-medium transition-colors"
                        >
                            {suggestion.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
