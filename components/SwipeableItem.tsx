import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Trash2, Edit } from 'lucide-react';

interface SwipeableItemProps {
    children: React.ReactNode;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    className?: string;
}

export default function SwipeableItem({
    children,
    onSwipeLeft,
    onSwipeRight,
    className = ''
}: SwipeableItemProps) {
    const [offset, setOffset] = useState(0);

    const handlers = useSwipeable({
        onSwiping: (eventData) => {
            setOffset(eventData.deltaX);
        },
        onSwipedLeft: () => {
            if (offset < -100 && onSwipeLeft) {
                onSwipeLeft();
            }
            setOffset(0);
        },
        onSwipedRight: () => {
            if (offset > 100 && onSwipeRight) {
                onSwipeRight();
            }
            setOffset(0);
        },
        onSwiped: () => {
            setOffset(0);
        },
        trackMouse: true,
        delta: 10,
    });

    const getBackground = () => {
        if (offset < 0) return 'bg-red-500'; // Left swipe (Delete)
        if (offset > 0) return 'bg-amber-500'; // Right swipe (Edit)
        return 'bg-white';
    };

    return (
        <div className={`relative overflow-hidden rounded-xl ${className}`}>
            {/* Background Actions layer */}
            <div className={`absolute inset-0 flex items-center justify-between px-6 ${getBackground()} text-white transition-colors duration-200`}>
                <div className={`flex items-center gap-2 ${offset > 0 ? 'opacity-100' : 'opacity-0'}`}>
                    <Edit size={24} />
                    <span className="font-bold">Edit</span>
                </div>
                <div className={`flex items-center gap-2 ${offset < 0 ? 'opacity-100' : 'opacity-0'}`}>
                    <span className="font-bold">Delete</span>
                    <Trash2 size={24} />
                </div>
            </div>

            {/* Foreground Content layer */}
            <div
                {...handlers}
                className="relative bg-white transition-transform duration-75 ease-out shadow-sm border border-slate-100 rounded-xl"
                style={{ transform: `translateX(${offset}px)` }}
            >
                {children}
            </div>
        </div>
    );
}
