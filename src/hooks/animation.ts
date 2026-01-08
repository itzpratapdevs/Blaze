import { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '../components/BlazeGame';

// ============================================
// EASING FUNCTIONS
// ============================================

export type EasingFunction = (t: number) => number;

export const Easing = {
    linear: (t: number) => t,

    // Quad
    easeInQuad: (t: number) => t * t,
    easeOutQuad: (t: number) => t * (2 - t),
    easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,

    // Cubic
    easeInCubic: (t: number) => t * t * t,
    easeOutCubic: (t: number) => (--t) * t * t + 1,
    easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

    // Elastic
    easeOutElastic: (t: number) => {
        const p = 0.3;
        return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
    },
    easeInElastic: (t: number) => {
        const p = 0.3;
        return -Math.pow(2, 10 * (t - 1)) * Math.sin(((t - 1) - p / 4) * (2 * Math.PI) / p);
    },

    // Bounce
    easeOutBounce: (t: number) => {
        if (t < 1 / 2.75) return 7.5625 * t * t;
        if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    },
    easeInBounce: (t: number) => 1 - Easing.easeOutBounce(1 - t),

    // Back
    easeInBack: (t: number) => {
        const s = 1.70158;
        return t * t * ((s + 1) * t - s);
    },
    easeOutBack: (t: number) => {
        const s = 1.70158;
        return (t -= 1) * t * ((s + 1) * t + s) + 1;
    },
};

// ============================================
// TWEEN HOOK
// ============================================

export interface TweenConfig {
    /** Start value */
    from: number;
    /** End value */
    to: number;
    /** Duration in seconds */
    duration: number;
    /** Easing function */
    easing?: EasingFunction;
    /** Called every frame with current value */
    onUpdate?: (value: number) => void;
    /** Called when tween completes */
    onComplete?: () => void;
    /** Auto-start the tween */
    autoStart?: boolean;
    /** Loop the tween */
    loop?: boolean;
    /** Ping-pong (reverse on complete) */
    yoyo?: boolean;
}

export interface TweenControls {
    value: number;
    progress: number;
    isPlaying: boolean;
    isComplete: boolean;
    play: () => void;
    pause: () => void;
    reset: () => void;
    reverse: () => void;
}

/**
 * Tween animation hook.
 * 
 * @example
 * ```tsx
 * const tween = useTween({
 *   from: 0,
 *   to: 100,
 *   duration: 1,
 *   easing: Easing.easeOutBounce,
 *   onUpdate: (value) => {
 *     playerRef.current.y = value;
 *   },
 * });
 * 
 * // Start on click
 * <button onClick={tween.play}>Jump!</button>
 * ```
 */
export function useTween(config: TweenConfig): TweenControls {
    const {
        from,
        to,
        duration,
        easing = Easing.linear,
        onUpdate,
        onComplete,
        autoStart = false,
        loop = false,
        yoyo = false,
    } = config;

    const { onUpdate: registerUpdate } = useGame();

    const stateRef = useRef({
        elapsed: 0,
        isPlaying: autoStart,
        isComplete: false,
        direction: 1,
        value: from,
    });

    const [, forceUpdate] = useState({});

    useEffect(() => {
        return registerUpdate((dt) => {
            const state = stateRef.current;
            if (!state.isPlaying || state.isComplete) return;

            state.elapsed += dt * state.direction;

            // Clamp elapsed
            let normalizedElapsed = Math.max(0, Math.min(duration, state.elapsed));
            let t = normalizedElapsed / duration;

            // Apply easing
            const easedT = easing(t);

            // Calculate value
            state.value = from + (to - from) * easedT;
            onUpdate?.(state.value);

            // Check completion
            if (state.direction > 0 && state.elapsed >= duration) {
                if (yoyo) {
                    state.direction = -1;
                } else if (loop) {
                    state.elapsed = 0;
                } else {
                    state.isComplete = true;
                    state.isPlaying = false;
                    onComplete?.();
                }
                forceUpdate({});
            } else if (state.direction < 0 && state.elapsed <= 0) {
                if (loop) {
                    state.direction = 1;
                } else {
                    state.isComplete = true;
                    state.isPlaying = false;
                    onComplete?.();
                }
                forceUpdate({});
            }
        });
    }, [registerUpdate, from, to, duration, easing, loop, yoyo, onUpdate, onComplete]);

    const state = stateRef.current;

    return {
        value: state.value,
        progress: Math.min(1, state.elapsed / duration),
        isPlaying: state.isPlaying,
        isComplete: state.isComplete,
        play: () => {
            state.isPlaying = true;
            state.isComplete = false;
            forceUpdate({});
        },
        pause: () => {
            state.isPlaying = false;
            forceUpdate({});
        },
        reset: () => {
            state.elapsed = 0;
            state.value = from;
            state.direction = 1;
            state.isComplete = false;
            forceUpdate({});
        },
        reverse: () => {
            state.direction *= -1;
            forceUpdate({});
        },
    };
}

// ============================================
// SPRING HOOK
// ============================================

export interface SpringConfig {
    /** Target value */
    target: number;
    /** Stiffness (higher = faster) */
    stiffness?: number;
    /** Damping (higher = less bounce) */
    damping?: number;
    /** Mass */
    mass?: number;
}

export interface SpringControls {
    value: number;
    velocity: number;
    isAtRest: boolean;
    setTarget: (target: number) => void;
}

/**
 * Spring physics animation hook.
 * 
 * @example
 * ```tsx
 * const spring = useSpring({ target: 100, stiffness: 200, damping: 10 });
 * 
 * // Update target on click
 * onClick={() => spring.setTarget(Math.random() * 400)}
 * 
 * // Use value
 * <Sprite x={spring.value} y={100} ... />
 * ```
 */
export function useSpring(config: SpringConfig): SpringControls {
    const {
        target: initialTarget,
        stiffness = 100,
        damping = 10,
        mass = 1,
    } = config;

    const { onUpdate: registerUpdate } = useGame();

    const stateRef = useRef({
        value: initialTarget,
        velocity: 0,
        target: initialTarget,
    });

    const [, forceUpdate] = useState({});

    useEffect(() => {
        return registerUpdate((dt) => {
            const state = stateRef.current;

            // Spring physics
            const displacement = state.target - state.value;
            const springForce = displacement * stiffness;
            const dampingForce = state.velocity * damping;
            const acceleration = (springForce - dampingForce) / mass;

            state.velocity += acceleration * dt;
            state.value += state.velocity * dt;
        });
    }, [registerUpdate, stiffness, damping, mass]);

    const state = stateRef.current;
    const isAtRest = Math.abs(state.velocity) < 0.01 && Math.abs(state.target - state.value) < 0.01;

    return {
        value: state.value,
        velocity: state.velocity,
        isAtRest,
        setTarget: (target: number) => {
            state.target = target;
            forceUpdate({});
        },
    };
}

// ============================================
// ANIMATE VALUE HOOK
// ============================================

/**
 * Simple animated value that smoothly transitions to target.
 * 
 * @example
 * ```tsx
 * const [opacity, setOpacity] = useAnimatedValue(1);
 * 
 * // Fade out
 * onClick={() => setOpacity(0)}
 * 
 * <Sprite opacity={opacity} ... />
 * ```
 */
export function useAnimatedValue(
    initialValue: number,
    speed = 5
): [number, (target: number) => void] {
    const { onUpdate: registerUpdate } = useGame();

    const stateRef = useRef({
        value: initialValue,
        target: initialValue,
    });

    const [, forceUpdate] = useState({});

    useEffect(() => {
        return registerUpdate((dt) => {
            const state = stateRef.current;
            const diff = state.target - state.value;

            if (Math.abs(diff) > 0.001) {
                state.value += diff * speed * dt;
            } else {
                state.value = state.target;
            }
        });
    }, [registerUpdate, speed]);

    return [
        stateRef.current.value,
        useCallback((target: number) => {
            stateRef.current.target = target;
            forceUpdate({});
        }, []),
    ];
}
