import { useState, useCallback, useEffect, useRef } from 'react';
import { Easing, EasingFunction } from '../effects/Easing';

/**
 * Tween state.
 */
export interface TweenState {
    isActive: boolean;
    isComplete: boolean;
    progress: number;
    value: number;
}

/**
 * Hook for tweening a value.
 *
 * @example
 * ```tsx
 * function FadeIn() {
 *   const { value: opacity, start } = useTween(0, 1, 0.5, Easing.easeOutQuad);
 *
 *   useEffect(() => { start(); }, []);
 *
 *   return <Sprite opacity={opacity} />;
 * }
 * ```
 */
export function useTween(
    from: number,
    to: number,
    duration: number,
    easing: EasingFunction = Easing.linear,
    onComplete?: () => void
) {
    const [state, setState] = useState<TweenState>({
        isActive: false,
        isComplete: false,
        progress: 0,
        value: from,
    });

    const startTimeRef = useRef<number>(0);
    const frameRef = useRef<number>(0);

    const start = useCallback(() => {
        startTimeRef.current = performance.now();
        setState({
            isActive: true,
            isComplete: false,
            progress: 0,
            value: from,
        });
    }, [from]);

    const stop = useCallback(() => {
        if (frameRef.current) {
            cancelAnimationFrame(frameRef.current);
        }
        setState(prev => ({ ...prev, isActive: false }));
    }, []);

    const reset = useCallback(() => {
        stop();
        setState({
            isActive: false,
            isComplete: false,
            progress: 0,
            value: from,
        });
    }, [from, stop]);

    useEffect(() => {
        if (!state.isActive || state.isComplete) return;

        const tick = (now: number) => {
            const elapsed = (now - startTimeRef.current) / 1000;
            const progress = Math.min(1, elapsed / duration);
            const easedProgress = easing(progress);
            const value = from + (to - from) * easedProgress;

            if (progress >= 1) {
                setState({
                    isActive: false,
                    isComplete: true,
                    progress: 1,
                    value: to,
                });
                onComplete?.();
            } else {
                setState({
                    isActive: true,
                    isComplete: false,
                    progress,
                    value,
                });
                frameRef.current = requestAnimationFrame(tick);
            }
        };

        frameRef.current = requestAnimationFrame(tick);
        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [state.isActive, state.isComplete, from, to, duration, easing, onComplete]);

    return {
        ...state,
        start,
        stop,
        reset,
    };
}

/**
 * Hook for spring animation.
 */
export function useSpring(
    target: number,
    config: { stiffness?: number; damping?: number } = {}
) {
    const { stiffness = 170, damping = 26 } = config;

    const [value, setValue] = useState(target);
    const velocityRef = useRef(0);

    useEffect(() => {
        let frameId: number;
        let lastTime = performance.now();

        const tick = (now: number) => {
            const dt = Math.min((now - lastTime) / 1000, 0.064);
            lastTime = now;

            const displacement = target - value;
            const springForce = displacement * stiffness;
            const dampingForce = velocityRef.current * damping;
            const acceleration = springForce - dampingForce;

            velocityRef.current += acceleration * dt;
            const newValue = value + velocityRef.current * dt;

            // Check if settled
            if (Math.abs(displacement) < 0.01 && Math.abs(velocityRef.current) < 0.01) {
                setValue(target);
                velocityRef.current = 0;
                return;
            }

            setValue(newValue);
            frameId = requestAnimationFrame(tick);
        };

        frameId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frameId);
    }, [target, stiffness, damping, value]);

    return value;
}

/**
 * Hook for sequence of tweens.
 */
export function useTweenSequence(
    steps: Array<{ from: number; to: number; duration: number; easing?: EasingFunction }>,
    onComplete?: () => void
) {
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [value, setValue] = useState(steps[0]?.from ?? 0);
    const [isActive, setIsActive] = useState(false);

    const start = useCallback(() => {
        setCurrentIndex(0);
        setIsActive(true);
        setValue(steps[0]?.from ?? 0);
    }, [steps]);

    const stop = useCallback(() => {
        setIsActive(false);
        setCurrentIndex(-1);
    }, []);

    useEffect(() => {
        if (!isActive || currentIndex < 0 || currentIndex >= steps.length) return;

        const step = steps[currentIndex];
        const easing = step.easing ?? Easing.linear;
        const startTime = performance.now();
        let frameId: number;

        const tick = (now: number) => {
            const elapsed = (now - startTime) / 1000;
            const progress = Math.min(1, elapsed / step.duration);
            const easedProgress = easing(progress);
            const newValue = step.from + (step.to - step.from) * easedProgress;

            setValue(newValue);

            if (progress >= 1) {
                if (currentIndex + 1 < steps.length) {
                    setCurrentIndex(currentIndex + 1);
                } else {
                    setIsActive(false);
                    onComplete?.();
                }
            } else {
                frameId = requestAnimationFrame(tick);
            }
        };

        frameId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frameId);
    }, [isActive, currentIndex, steps, onComplete]);

    return {
        value,
        isActive,
        currentStep: currentIndex,
        start,
        stop,
    };
}
