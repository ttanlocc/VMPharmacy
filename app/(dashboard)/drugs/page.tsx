'use client';

import DrugPicker from '@/components/DrugPicker';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export default function DrugsPage() {
    const [isAdding, setIsAdding] = useState(false);

    const handleSelectDrug = (drug: any) => {
        // Open edit modal
        console.log('Selected drug for edit:', drug);
    };

    return (
        <div className="h-screen flex flex-col pt-safe">
            {/* Header is handled inside DrugPicker or here? DrugPicker has its own search bar. 
           We might want to wrap DrugPicker or customize it. 
           For this page, DrugPicker IS the main content. */}

            {/* Floating Action Button for Adding Drug */}
            <div className="fixed bottom-24 right-6 z-20">
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg shadow-sky-200 transition-transform active:scale-95"
                >
                    <Plus size={28} />
                </button>
            </div>

            {/* Drug Picker handles the grid and search */}
            <div className="flex-1 overflow-hidden">
                <DrugPicker onSelect={handleSelectDrug} />
            </div>

            {/* Add Drug Modal would go here */}
        </div>
    );
}
