import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import DrugCard from './DrugCard';
import { useCart } from './CartProvider';

// Using the same interface as DrugCard
interface Drug {
    id: string;
    name: string;
    unit: string;
    unit_price: number;
    image_url: string | null;
    group_id?: string;
}

interface DrugPickerProps {
    onSelect?: (drug: Drug) => void;
    apiBaseUrl?: string; // Optional for SWR/Fetch
}

export default function DrugPicker({ onSelect }: DrugPickerProps) {
    const { addItem } = useCart();
    const [selectedGroup, setSelectedGroup] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [drugs, setDrugs] = useState<Drug[]>([]);
    const [groups, setGroups] = useState<{ id: string, name: string }[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch drugs and groups on mount
    useEffect(() => {
        async function fetchData() {
            try {
                // In a real app, verify these endpoints exist or use SWR
                const [drugsRes, groupsRes] = await Promise.all([
                    fetch('/api/drugs').then(res => res.ok ? res.json() : []),
                    // fetch('/api/groups').then(res => res.json()) // We haven't created this API yet, so we mock or use empty
                    Promise.resolve([{ id: 'g1', name: 'Antibiotics' }, { id: 'g2', name: 'Vitamins' }, { id: 'g3', name: 'Analgesics' }])
                ]);

                setDrugs(drugsRes);
                setGroups(groupsRes);
            } catch (error) {
                console.error('Failed to fetch data', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const filteredDrugs = drugs.filter(drug => {
        const matchesGroup = selectedGroup === 'all' || drug.group_id === selectedGroup;
        const matchesSearch = drug.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesGroup && matchesSearch;
    });

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Search Bar */}
            <div className="p-4 bg-white border-b sticky top-0 z-10">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search drugs..."
                        className="w-full pl-10 pr-4 py-3 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-sky-500 outline-none text-slate-900"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Horizontal Scrollable Groups */}
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
                    <button
                        onClick={() => setSelectedGroup('all')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedGroup === 'all'
                            ? 'bg-sky-500 text-white shadow-md shadow-sky-200'
                            : 'bg-white text-slate-600 border border-slate-200'
                            }`}
                    >
                        All
                    </button>
                    {groups.map(group => (
                        <button
                            key={group.id}
                            onClick={() => setSelectedGroup(group.id)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedGroup === group.id
                                ? 'bg-sky-500 text-white shadow-md shadow-sky-200'
                                : 'bg-white text-slate-600 border border-slate-200'
                                }`}
                        >
                            {group.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Drug Grid */}
            <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                    <div className="flex justify-center p-8 text-slate-400">Loading...</div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-20">
                        {filteredDrugs.map(drug => (
                            <DrugCard
                                key={drug.id}
                                drug={drug}
                                onSelect={(d) => {
                                    if (onSelect) onSelect(d);
                                    else {
                                        addItem(d);
                                        // Optional: Visual feedback toast
                                    }
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
