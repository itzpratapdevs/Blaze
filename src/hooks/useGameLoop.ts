import { useRef, useCallback, useEffect } from 'react';
import { Time } from '../utils/Time';

/**
 * Update callback type.
 */
export type UpdateCallback = (dt: number) => void;

/**
 * Hook to register an update callback that runs every frame.
 *
 * @example
 * ```tsx
 * function Player() {
 *   const [x, setX] = useState(100);
 *
 *   useGameLoop((dt) => {
 *     setX(prev => prev + 100 * dt);
 *   });
 *
 *   return <Sprite x={x} y={200} width={32} height={32} />;
 * }
 * ```
 */
export function useGameLoop(callback: UpdateCallback, deps: any[] = []) {
    const callbackRef = useRef<UpdateCallback>(callback);
    const frameRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);

    // Update callback ref when it changes
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback, ...deps]);

    useEffect(() => {
        const loop = (timestamp: number) => {
            if (lastTimeRef.current === 0) {
                lastTimeRef.current = timestamp;
            }

            const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);
            lastTimeRef.current = timestamp;

            callbackRef.current(dt);
            frameRef.current = requestAnimationFrame(loop);
        };

        frameRef.current = requestAnimationFrame(loop);

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, []);
}

/**
 * Hook to get current frame time info.
 */
export function useFrameTime() {
    return {
        delta: Time.delta,
        elapsed: Time.elapsed,
        fps: Time.fps,
        frameCount: Time.frameCount,
    };
}

/**
 * Hook for fixed timestep updates (physics).
 */
export function useFixedUpdate(
    callback: UpdateCallback,
    fixedDt: number = 1 / 60,
    deps: any[] = []
) {
    const accumulatorRef = useRef(0);
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback, ...deps]);

    useGameLoop((dt) => {
        accumulatorRef.current += dt;

        while (accumulatorRef.current >= fixedDt) {
            callbackRef.current(fixedDt);
            accumulatorRef.current -= fixedDt;
        }
    });
}
