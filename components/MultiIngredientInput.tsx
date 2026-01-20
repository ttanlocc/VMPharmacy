'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Ingredient {
    name: string;
    dosage: string;
}

interface MultiIngredientInputProps {
    value: string; // "Paracetamol 500mg, Ibuprofen 200mg"
    onChange: (value: string) => void;
}

export default function MultiIngredientInput({ value, onChange }: MultiIngredientInputProps) {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [dosageInput, setDosageInput] = useState('');
    const [suggestions, setSuggestions] = useState<{ id: string; name: string }[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showDosageModal, setShowDosageModal] = useState(false);
    const [pendingIngredient, setPendingIngredient] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Parse value string into ingredients array on mount/change
    useEffect(() => {
        if (!value) {
            setIngredients([]);
            return;
        }

        const parsed = value.split(',').map(item => {
            const trimmed = item.trim();
            // Try to extract name and dosage
            // Pattern: "Name dose" or just "Name"
            const match = trimmed.match(/^(.+?)\s+(\d+.*?)$/);
            if (match) {
                return { name: match[1].trim(), dosage: match[2].trim() };
            }
            return { name: trimmed, dosage: '' };
        }).filter(i => i.name);

        setIngredients(parsed);
    }, [value]);

    // Convert ingredients array back to string
    const updateValue = (newIngredients: Ingredient[]) => {
        setIngredients(newIngredients);
        const valueString = newIngredients
            .map(i => i.dosage ? `${i.name} ${i.dosage}` : i.name)
            .join(', ');
        onChange(valueString);
    };

    // Close suggestions when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (!query) {
            setSuggestions([]);
            return;
        }

        const { data } = await supabase
            .from('ingredients')
            .select('id, name')
            .ilike('name', `%${query}%`)
            .limit(8);

        if (data) {
            setSuggestions(data);
            setShowSuggestions(true);
        }
    };

    const handleSelectIngredient = (name: string) => {
        setPendingIngredient(name);
        setShowSuggestions(false);
        setShowDosageModal(true);
        setSearchQuery('');
        setDosageInput('');
    };

    const handleAddIngredient = () => {
        if (!pendingIngredient) return;

        // Check for duplicates
        if (ingredients.some(i => i.name.toLowerCase() === pendingIngredient.toLowerCase())) {
            setShowDosageModal(false);
            setPendingIngredient('');
            setDosageInput('');
            return;
        }

        const newIngredient: Ingredient = {
            name: pendingIngredient,
            dosage: dosageInput.trim()
        };

        updateValue([...ingredients, newIngredient]);
        setShowDosageModal(false);
        setPendingIngredient('');
        setDosageInput('');
    };

    const handleRemoveIngredient = (index: number) => {
        const newIngredients = ingredients.filter((_, i) => i !== index);
        updateValue(newIngredients);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && showDosageModal) {
            e.preventDefault();
            handleAddIngredient();
        }
    };

    return (
        <div className="space-y-3" ref={wrapperRef}>
            {/* Tags Display */}
            {ingredients.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {ingredients.map((ingredient, index) => (
                        <div
                            key={index}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100"
                        >
                            <span>
                                {ingredient.name}
                                {ingredient.dosage && (
                                    <span className="ml-1 font-bold">{ingredient.dosage}</span>
                                )}
                            </span>
                            <button
                                type="button"
                                onClick={() => handleRemoveIngredient(index)}
                                className="hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Search Input */}
            <div className="relative">
                <Input
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder={ingredients.length > 0 ? "Thêm hoạt chất khác..." : "VD: Paracetamol"}
                    onFocus={() => {
                        if (searchQuery && suggestions.length > 0) setShowSuggestions(true);
                    }}
                />

                {/* Autocomplete Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-lg max-h-60 overflow-auto">
                        {suggestions.map((suggestion) => (
                            <button
                                key={suggestion.id}
                                type="button"
                                onClick={() => handleSelectIngredient(suggestion.name)}
                                className={cn(
                                    "w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-blue-50 border-b border-slate-50 last:border-0 font-medium transition-colors",
                                    ingredients.some(i => i.name.toLowerCase() === suggestion.name.toLowerCase()) && "opacity-50"
                                )}
                            >
                                {suggestion.name}
                                {ingredients.some(i => i.name.toLowerCase() === suggestion.name.toLowerCase()) && (
                                    <span className="ml-2 text-xs text-slate-700">(đã thêm)</span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Dosage Modal */}
            {showDosageModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">
                                Thêm hàm lượng cho {pendingIngredient}
                            </h3>
                            <Input
                                autoFocus
                                value={dosageInput}
                                onChange={(e) => setDosageInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="VD: 500mg, 200mg, 10ml..."
                                className="mb-4"
                            />
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDosageModal(false);
                                        setPendingIngredient('');
                                        setDosageInput('');
                                    }}
                                    className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAddIngredient}
                                    className="flex-1 py-2.5 px-4 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus size={18} />
                                    Thêm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
