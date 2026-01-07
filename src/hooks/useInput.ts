import { useState, useCallback, useEffect, useRef } from 'react';
import { Vector2 } from '../math/Vector2';

/**
 * Touch state.
 */
export interface TouchState {
    isTouching: boolean;
    x: number;
    y: number;
    startX: number;
    startY: number;
    deltaX: number;
    deltaY: number;
}

/**
 * Hook for touch input.
 *
 * @example
 * ```tsx
 * function Player() {
 *   const { isTouching, x, y, deltaX } = useTouch();
 *
 *   useGameLoop(() => {
 *     if (isTouching) {
 *       // Move towards touch
 *       playerX.current += (x - playerX.current) * 0.1;
 *     }
 *   });
 *
 *   return <Sprite x={playerX.current} y={200} />;
 * }
 * ```
 */
export function useTouch() {
    const [state, setState] = useState<TouchState>({
        isTouching: false,
        x: 0,
        y: 0,
        startX: 0,
        startY: 0,
        deltaX: 0,
        deltaY: 0,
    });

    const handleTouchStart = useCallback((x: number, y: number) => {
        setState({
            isTouching: true,
            x,
            y,
            startX: x,
            startY: y,
            deltaX: 0,
            deltaY: 0,
        });
    }, []);

    const handleTouchMove = useCallback((x: number, y: number) => {
        setState(prev => ({
            ...prev,
            deltaX: x - prev.x,
            deltaY: y - prev.y,
            x,
            y,
        }));
    }, []);

    const handleTouchEnd = useCallback(() => {
        setState(prev => ({
            ...prev,
            isTouching: false,
        }));
    }, []);

    return {
        ...state,
        handlers: {
            onTouchStart: handleTouchStart,
            onTouchMove: handleTouchMove,
            onTouchEnd: handleTouchEnd,
        },
    };
}

/**
 * Hook for tap detection.
 */
export function useTap(onTap: (x: number, y: number) => void) {
    const startRef = useRef<{ x: number; y: number; time: number } | null>(null);
    const TAP_THRESHOLD = 10;
    const TAP_TIMEOUT = 300;

    const handleTouchStart = useCallback((x: number, y: number) => {
        startRef.current = { x, y, time: Date.now() };
    }, []);

    const handleTouchEnd = useCallback((x: number, y: number) => {
        if (!startRef.current) return;

        const dx = x - startRef.current.x;
        const dy = y - startRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const duration = Date.now() - startRef.current.time;

        if (dist < TAP_THRESHOLD && duration < TAP_TIMEOUT) {
            onTap(x, y);
        }

        startRef.current = null;
    }, [onTap]);

    return {
        onTouchStart: handleTouchStart,
        onTouchEnd: handleTouchEnd,
    };
}

/**
 * Hook for drag detection.
 */
export function useDrag() {
    const [isDragging, setIsDragging] = useState(false);
    const [delta, setDelta] = useState<Vector2>(new Vector2());
    const [total, setTotal] = useState<Vector2>(new Vector2());
    const lastPosRef = useRef<Vector2 | null>(null);
    const startPosRef = useRef<Vector2 | null>(null);

    const handleTouchStart = useCallback((x: number, y: number) => {
        setIsDragging(true);
        lastPosRef.current = new Vector2(x, y);
        startPosRef.current = new Vector2(x, y);
        setDelta(new Vector2());
        setTotal(new Vector2());
    }, []);

    const handleTouchMove = useCallback((x: number, y: number) => {
        if (!lastPosRef.current || !startPosRef.current) return;

        const dx = x - lastPosRef.current.x;
        const dy = y - lastPosRef.current.y;
        setDelta(new Vector2(dx, dy));

        const totalX = x - startPosRef.current.x;
        const totalY = y - startPosRef.current.y;
        setTotal(new Vector2(totalX, totalY));

        lastPosRef.current = new Vector2(x, y);
    }, []);

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
        lastPosRef.current = null;
        startPosRef.current = null;
    }, []);

    return {
        isDragging,
        delta,
        total,
        handlers: {
            onTouchStart: handleTouchStart,
            onTouchMove: handleTouchMove,
            onTouchEnd: handleTouchEnd,
        },
    };
}

/**
 * Hook for swipe detection.
 */
export function useSwipe(
    onSwipe: (direction: 'up' | 'down' | 'left' | 'right', velocity: number) => void,
    threshold: number = 50
) {
    const startRef = useRef<{ x: number; y: number; time: number } | null>(null);

    const handleTouchStart = useCallback((x: number, y: number) => {
        startRef.current = { x, y, time: Date.now() };
    }, []);

    const handleTouchEnd = useCallback((x: number, y: number) => {
        if (!startRef.current) return;

        const dx = x - startRef.current.x;
        const dy = y - startRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const duration = (Date.now() - startRef.current.time) / 1000;
        const velocity = dist / duration;

        if (dist >= threshold) {
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);

            if (absDx > absDy) {
                onSwipe(dx > 0 ? 'right' : 'left', velocity);
            } else {
                onSwipe(dy > 0 ? 'down' : 'up', velocity);
            }
        }

        startRef.current = null;
    }, [onSwipe, threshold]);

    return {
        onTouchStart: handleTouchStart,
        onTouchEnd: handleTouchEnd,
    };
}
