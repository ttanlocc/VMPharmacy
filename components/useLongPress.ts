'use client';

import { useRef, useCallback } from 'react';

interface Options {
    threshold?: number;
    onStart?: () => void;
    onFinish?: () => void;
    onCancel?: () => void;
}

export function useLongPress(callback: () => void, options: Options = {}) {
    const { threshold = 500, onStart, onFinish, onCancel } = options;
    const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const isLongPress = useRef(false);

    const start = useCallback((event: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
        // Only left click or touch
        if ('button' in event && event.button !== 0) return;

        isLongPress.current = false;
        onStart?.();

        timerRef.current = setTimeout(() => {
            isLongPress.current = true;
            callback();
        }, threshold);
    }, [callback, threshold, onStart]);

    const stop = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            onFinish?.();
        }
    }, [onFinish]);


    const cancel = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            onCancel?.();
        }
    }, [onCancel]);

    return {
        onMouseDown: start,
        onMouseUp: stop,
        onMouseLeave: cancel,
        onTouchStart: start,
        onTouchEnd: stop,
        onTouchCancel: cancel,
    };
}
