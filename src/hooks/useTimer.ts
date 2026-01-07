import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Hook for creating a timer.
 *
 * @example
 * ```tsx
 * function SpawnSystem() {
 *   const { start, isComplete } = useTimer(2, () => {
 *     spawnEnemy();
 *   }, { repeat: true });
 *
 *   useEffect(() => { start(); }, []);
 *
 *   return null;
 * }
 * ```
 */
export function useTimer(
    duration: number,
    onComplete?: () => void,
    options: { repeat?: boolean; autoStart?: boolean } = {}
) {
    const [isActive, setIsActive] = useState(options.autoStart ?? false);
    const [isComplete, setIsComplete] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [progress, setProgress] = useState(0);

    const callbackRef = useRef(onComplete);
    callbackRef.current = onComplete;

    const start = useCallback(() => {
        setIsActive(true);
        setIsComplete(false);
        setElapsed(0);
        setProgress(0);
    }, []);

    const pause = useCallback(() => {
        setIsActive(false);
    }, []);

    const resume = useCallback(() => {
        if (!isComplete) {
            setIsActive(true);
        }
    }, [isComplete]);

    const reset = useCallback(() => {
        setIsActive(false);
        setIsComplete(false);
        setElapsed(0);
        setProgress(0);
    }, []);

    useEffect(() => {
        if (!isActive) return;

        let frameId: number;
        let lastTime = performance.now();

        const tick = (now: number) => {
            const dt = (now - lastTime) / 1000;
            lastTime = now;

            setElapsed(prev => {
                const newElapsed = prev + dt;
                const newProgress = Math.min(1, newElapsed / duration);
                setProgress(newProgress);

                if (newElapsed >= duration) {
                    callbackRef.current?.();

                    if (options.repeat) {
                        return newElapsed - duration;
                    } else {
                        setIsActive(false);
                        setIsComplete(true);
                        return duration;
                    }
                }

                return newElapsed;
            });

            frameId = requestAnimationFrame(tick);
        };

        frameId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frameId);
    }, [isActive, duration, options.repeat]);

    return {
        isActive,
        isComplete,
        elapsed,
        progress,
        remaining: Math.max(0, duration - elapsed),
        start,
        pause,
        resume,
        reset,
    };
}

/**
 * Hook for delayed execution.
 */
export function useDelay(callback: () => void, delay: number, deps: any[] = []) {
    const { start } = useTimer(delay, callback);

    useEffect(() => {
        start();
    }, deps);
}

/**
 * Hook for interval execution.
 */
export function useInterval(
    callback: () => void,
    interval: number,
    autoStart: boolean = true
) {
    return useTimer(interval, callback, { repeat: true, autoStart });
}
