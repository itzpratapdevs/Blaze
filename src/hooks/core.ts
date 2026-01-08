import { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '../components/BlazeGame';

// ============================================
// INPUT HOOK - UNIFIED INPUT FOR ALL PLATFORMS
// ============================================

export interface Vec2 {
    x: number;
    y: number;
}

export interface InputState {
    /** Is any pointer currently pressed */
    isPressed: boolean;
    /** Was pointer just pressed this frame */
    justPressed: boolean;
    /** Was pointer just released this frame */
    justReleased: boolean;
    /** Current pointer position (or last known) */
    position: Vec2;
    /** Movement delta since last frame */
    delta: Vec2;
    /** Check if a key is currently held down */
    isKeyDown: (key: string) => boolean;
    /** Check if a key was just pressed this frame */
    isKeyPressed: (key: string) => boolean;
    /** Check if a key was just released this frame */
    isKeyReleased: (key: string) => boolean;
    /** Get all currently held keys */
    keysDown: string[];
}

/**
 * Unified input hook for mouse, touch, and keyboard.
 * Works on web and React Native.
 * 
 * @example
 * ```tsx
 * function Player() {
 *   const input = useInput();
 *   
 *   useGameLoop((dt) => {
 *     if (input.isKeyDown('ArrowLeft')) player.x -= 200 * dt;
 *     if (input.isKeyDown('ArrowRight')) player.x += 200 * dt;
 *     if (input.justPressed) shoot();
 *   });
 * }
 * ```
 */
export function useInput(): InputState {
    const { canvasRef, onUpdate } = useGame();

    const stateRef = useRef({
        isPressed: false,
        wasPressed: false,
        position: { x: 0, y: 0 },
        lastPosition: { x: 0, y: 0 },
        keysDown: new Set<string>(),
        keysPressed: new Set<string>(),
        keysReleased: new Set<string>(),
    });

    const [, forceUpdate] = useState({});

    // Setup event listeners
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const state = stateRef.current;

        // Pointer events (works for mouse and touch)
        const handlePointerDown = (e: PointerEvent) => {
            const rect = canvas.getBoundingClientRect();
            state.isPressed = true;
            state.position = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
        };

        const handlePointerMove = (e: PointerEvent) => {
            const rect = canvas.getBoundingClientRect();
            state.position = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
        };

        const handlePointerUp = () => {
            state.isPressed = false;
        };

        // Keyboard events
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!state.keysDown.has(e.key)) {
                state.keysPressed.add(e.key);
            }
            state.keysDown.add(e.key);
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            state.keysDown.delete(e.key);
            state.keysReleased.add(e.key);
        };

        // Add listeners
        canvas.addEventListener('pointerdown', handlePointerDown);
        canvas.addEventListener('pointermove', handlePointerMove);
        canvas.addEventListener('pointerup', handlePointerUp);
        canvas.addEventListener('pointerleave', handlePointerUp);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            canvas.removeEventListener('pointerdown', handlePointerDown);
            canvas.removeEventListener('pointermove', handlePointerMove);
            canvas.removeEventListener('pointerup', handlePointerUp);
            canvas.removeEventListener('pointerleave', handlePointerUp);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [canvasRef]);

    // Clear per-frame state at end of frame
    useEffect(() => {
        return onUpdate(() => {
            const state = stateRef.current;
            state.wasPressed = state.isPressed;
            state.lastPosition = { ...state.position };
            state.keysPressed.clear();
            state.keysReleased.clear();
        });
    }, [onUpdate]);

    // Return input state
    const state = stateRef.current;

    return {
        isPressed: state.isPressed,
        justPressed: state.isPressed && !state.wasPressed,
        justReleased: !state.isPressed && state.wasPressed,
        position: state.position,
        delta: {
            x: state.position.x - state.lastPosition.x,
            y: state.position.y - state.lastPosition.y,
        },
        isKeyDown: (key: string) => state.keysDown.has(key),
        isKeyPressed: (key: string) => state.keysPressed.has(key),
        isKeyReleased: (key: string) => state.keysReleased.has(key),
        keysDown: Array.from(state.keysDown),
    };
}

// ============================================
// GAME LOOP HOOKS
// ============================================

/**
 * Register a callback that runs every frame.
 * 
 * @example
 * ```tsx
 * useGameLoop((dt) => {
 *   player.x += velocity * dt;
 * });
 * ```
 */
export function useGameLoop(callback: (dt: number) => void) {
    const { onUpdate } = useGame();
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    useEffect(() => {
        return onUpdate((dt) => callbackRef.current(dt));
    }, [onUpdate]);
}

/**
 * Register a callback that runs at fixed intervals (60Hz).
 * Best for physics calculations.
 * 
 * @example
 * ```tsx
 * useFixedUpdate((dt) => {
 *   applyGravity(dt);
 *   resolveCollisions();
 * });
 * ```
 */
export function useFixedUpdate(callback: (dt: number) => void) {
    const { onFixedUpdate } = useGame();
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    useEffect(() => {
        return onFixedUpdate((dt) => callbackRef.current(dt));
    }, [onFixedUpdate]);
}

// ============================================
// TIMER HOOK
// ============================================

export interface Timer {
    elapsed: number;
    remaining: number;
    progress: number;
    isComplete: boolean;
    isRunning: boolean;
    start: () => void;
    stop: () => void;
    reset: () => void;
    restart: () => void;
}

/**
 * Timer hook for delayed actions.
 * 
 * @example
 * ```tsx
 * const timer = useTimer(5, { onComplete: () => spawnEnemy() });
 * 
 * // Start timer
 * timer.start();
 * 
 * // Show countdown
 * <Text>{timer.remaining.toFixed(1)}s</Text>
 * ```
 */
export function useTimer(
    duration: number,
    options?: {
        autoStart?: boolean;
        loop?: boolean;
        onComplete?: () => void;
        onUpdate?: (elapsed: number) => void;
    }
): Timer {
    const { onUpdate } = useGame();
    const { autoStart = false, loop = false, onComplete, onUpdate: onTimerUpdate } = options || {};

    const stateRef = useRef({
        elapsed: 0,
        isRunning: autoStart,
        isComplete: false,
    });

    const [, forceUpdate] = useState({});

    useEffect(() => {
        return onUpdate((dt) => {
            const state = stateRef.current;
            if (!state.isRunning || state.isComplete) return;

            state.elapsed += dt;
            onTimerUpdate?.(state.elapsed);

            if (state.elapsed >= duration) {
                state.isComplete = true;
                state.isRunning = false;
                onComplete?.();

                if (loop) {
                    state.elapsed = 0;
                    state.isComplete = false;
                    state.isRunning = true;
                }

                forceUpdate({});
            }
        });
    }, [onUpdate, duration, loop, onComplete, onTimerUpdate]);

    const state = stateRef.current;

    return {
        elapsed: state.elapsed,
        remaining: Math.max(0, duration - state.elapsed),
        progress: Math.min(1, state.elapsed / duration),
        isComplete: state.isComplete,
        isRunning: state.isRunning,
        start: () => {
            state.isRunning = true;
            forceUpdate({});
        },
        stop: () => {
            state.isRunning = false;
            forceUpdate({});
        },
        reset: () => {
            state.elapsed = 0;
            state.isComplete = false;
            forceUpdate({});
        },
        restart: () => {
            state.elapsed = 0;
            state.isComplete = false;
            state.isRunning = true;
            forceUpdate({});
        },
    };
}

// ============================================
// INTERVAL HOOK
// ============================================

/**
 * Run a callback at regular intervals.
 * 
 * @example
 * ```tsx
 * useInterval(() => {
 *   spawnEnemy();
 * }, 2000); // Every 2 seconds
 * ```
 */
export function useInterval(callback: () => void, ms: number, active = true) {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;
    const accumulatorRef = useRef(0);
    const { onUpdate } = useGame();

    useEffect(() => {
        if (!active) return;

        return onUpdate((dt) => {
            accumulatorRef.current += dt * 1000;
            if (accumulatorRef.current >= ms) {
                accumulatorRef.current -= ms;
                callbackRef.current();
            }
        });
    }, [onUpdate, ms, active]);
}

// ============================================
// DELAY HOOK
// ============================================

/**
 * Run a callback after a delay (once).
 * 
 * @example
 * ```tsx
 * useDelay(() => {
 *   showGameOver();
 * }, 3000); // After 3 seconds
 * ```
 */
export function useDelay(callback: () => void, ms: number, active = true) {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;
    const elapsedRef = useRef(0);
    const firedRef = useRef(false);
    const { onUpdate } = useGame();

    useEffect(() => {
        if (!active || firedRef.current) return;

        return onUpdate((dt) => {
            elapsedRef.current += dt * 1000;
            if (elapsedRef.current >= ms && !firedRef.current) {
                firedRef.current = true;
                callbackRef.current();
            }
        });
    }, [onUpdate, ms, active]);
}
