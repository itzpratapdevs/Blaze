import React, { createContext, useContext, useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useGame } from './BlazeGame';

// ============================================
// CAMERA CONTEXT
// ============================================

export interface CameraState {
    x: number;
    y: number;
    zoom: number;
    rotation: number;
    shakeIntensity: number;
    shakeOffset: { x: number; y: number };
}

export interface CameraContextValue extends CameraState {
    /** Set camera position */
    setPosition: (x: number, y: number) => void;
    /** Move camera by delta */
    move: (dx: number, dy: number) => void;
    /** Move camera to position smoothly */
    moveTo: (x: number, y: number, speed?: number) => void;
    /** Set zoom level */
    setZoom: (zoom: number) => void;
    /** Set rotation (radians) */
    setRotation: (rotation: number) => void;
    /** Follow a target position */
    follow: (x: number, y: number, speed?: number) => void;
    /** Trigger screen shake */
    shake: (intensity: number, duration: number) => void;
    /** Set world bounds */
    setBounds: (bounds: { x: number; y: number; width: number; height: number } | null) => void;
    /** Convert world coords to screen coords */
    worldToScreen: (x: number, y: number) => { x: number; y: number };
    /** Convert screen coords to world coords */
    screenToWorld: (x: number, y: number) => { x: number; y: number };
}

const CameraContext = createContext<CameraContextValue | null>(null);

/**
 * Hook to access and control the camera.
 * Must be used within a <Camera> component.
 */
export function useCamera(): CameraContextValue {
    const context = useContext(CameraContext);
    if (!context) {
        throw new Error('useCamera must be used within a <Camera> component');
    }
    return context;
}

// ============================================
// CAMERA COMPONENT
// ============================================

export interface CameraProps {
    /** Initial X position */
    x?: number;
    /** Initial Y position */
    y?: number;
    /** Initial zoom level (1 = 100%) */
    zoom?: number;
    /** Initial rotation in radians */
    rotation?: number;
    /** World bounds to constrain camera */
    bounds?: { x: number; y: number; width: number; height: number };
    /** Smooth follow speed (0-1, higher = faster) */
    followSpeed?: number;
    /** Render children */
    children?: React.ReactNode;
}

/**
 * Camera component for viewport control.
 * Wrap your game content with this for camera functionality.
 * 
 * @example
 * ```tsx
 * <BlazeGame width={800} height={600}>
 *   <Camera followSpeed={0.1}>
 *     <Player />
 *     <Enemies />
 *   </Camera>
 * </BlazeGame>
 * ```
 */
export function Camera({
    x: initialX = 0,
    y: initialY = 0,
    zoom: initialZoom = 1,
    rotation: initialRotation = 0,
    bounds: initialBounds,
    followSpeed = 0.1,
    children,
}: CameraProps) {
    const { ctx, width, height, onUpdate } = useGame();

    // Camera state
    const state = useRef({
        x: initialX,
        y: initialY,
        targetX: initialX,
        targetY: initialY,
        zoom: initialZoom,
        rotation: initialRotation,
        shakeIntensity: 0,
        shakeDuration: 0,
        shakeTime: 0,
        shakeOffset: { x: 0, y: 0 },
        bounds: initialBounds || null,
        followSpeed,
    });

    const [, forceUpdate] = useState({});

    // Update camera each frame
    useEffect(() => {
        return onUpdate((dt) => {
            const s = state.current;

            // Smooth follow to target
            const dx = s.targetX - s.x;
            const dy = s.targetY - s.y;
            s.x += dx * s.followSpeed;
            s.y += dy * s.followSpeed;

            // Clamp to bounds
            if (s.bounds) {
                const halfWidth = (width / s.zoom) / 2;
                const halfHeight = (height / s.zoom) / 2;

                s.x = Math.max(s.bounds.x + halfWidth, Math.min(s.bounds.x + s.bounds.width - halfWidth, s.x));
                s.y = Math.max(s.bounds.y + halfHeight, Math.min(s.bounds.y + s.bounds.height - halfHeight, s.y));
            }

            // Screen shake
            if (s.shakeTime < s.shakeDuration) {
                s.shakeTime += dt;
                const progress = s.shakeTime / s.shakeDuration;
                const intensity = s.shakeIntensity * (1 - progress); // Fade out
                s.shakeOffset = {
                    x: (Math.random() - 0.5) * intensity * 2,
                    y: (Math.random() - 0.5) * intensity * 2,
                };
            } else {
                s.shakeOffset = { x: 0, y: 0 };
            }
        });
    }, [onUpdate, width, height]);

    // Apply camera transform to canvas
    useEffect(() => {
        if (!ctx) return;

        return onUpdate(() => {
            const s = state.current;

            ctx.save();

            // Center on screen
            ctx.translate(width / 2, height / 2);

            // Apply shake
            ctx.translate(s.shakeOffset.x, s.shakeOffset.y);

            // Apply rotation
            if (s.rotation !== 0) {
                ctx.rotate(s.rotation);
            }

            // Apply zoom
            if (s.zoom !== 1) {
                ctx.scale(s.zoom, s.zoom);
            }

            // Apply camera position (inverse - move world opposite to camera)
            ctx.translate(-s.x, -s.y);
        });
    }, [ctx, onUpdate, width, height]);

    // Reset transform after children render
    useEffect(() => {
        if (!ctx) return;

        // This runs after all child updates
        return onUpdate(() => {
            ctx.restore();
        });
    }, [ctx, onUpdate]);

    // Control functions
    const setPosition = useCallback((x: number, y: number) => {
        state.current.x = x;
        state.current.y = y;
        state.current.targetX = x;
        state.current.targetY = y;
    }, []);

    const move = useCallback((dx: number, dy: number) => {
        state.current.targetX += dx;
        state.current.targetY += dy;
    }, []);

    const moveTo = useCallback((x: number, y: number, speed?: number) => {
        state.current.targetX = x;
        state.current.targetY = y;
        if (speed !== undefined) {
            state.current.followSpeed = speed;
        }
    }, []);

    const setZoom = useCallback((zoom: number) => {
        state.current.zoom = Math.max(0.1, Math.min(10, zoom));
        forceUpdate({});
    }, []);

    const setRotation = useCallback((rotation: number) => {
        state.current.rotation = rotation;
        forceUpdate({});
    }, []);

    const follow = useCallback((x: number, y: number, speed?: number) => {
        state.current.targetX = x;
        state.current.targetY = y;
        if (speed !== undefined) {
            state.current.followSpeed = speed;
        }
    }, []);

    const shake = useCallback((intensity: number, duration: number) => {
        state.current.shakeIntensity = intensity;
        state.current.shakeDuration = duration;
        state.current.shakeTime = 0;
    }, []);

    const setBounds = useCallback((bounds: { x: number; y: number; width: number; height: number } | null) => {
        state.current.bounds = bounds;
    }, []);

    const worldToScreen = useCallback((x: number, y: number) => {
        const s = state.current;
        return {
            x: (x - s.x) * s.zoom + width / 2 + s.shakeOffset.x,
            y: (y - s.y) * s.zoom + height / 2 + s.shakeOffset.y,
        };
    }, [width, height]);

    const screenToWorld = useCallback((x: number, y: number) => {
        const s = state.current;
        return {
            x: (x - width / 2 - s.shakeOffset.x) / s.zoom + s.x,
            y: (y - height / 2 - s.shakeOffset.y) / s.zoom + s.y,
        };
    }, [width, height]);

    // Context value
    const contextValue = useMemo<CameraContextValue>(() => ({
        x: state.current.x,
        y: state.current.y,
        zoom: state.current.zoom,
        rotation: state.current.rotation,
        shakeIntensity: state.current.shakeIntensity,
        shakeOffset: state.current.shakeOffset,
        setPosition,
        move,
        moveTo,
        setZoom,
        setRotation,
        follow,
        shake,
        setBounds,
        worldToScreen,
        screenToWorld,
    }), [setPosition, move, moveTo, setZoom, setRotation, follow, shake, setBounds, worldToScreen, screenToWorld]);

    return (
        <CameraContext.Provider value={contextValue}>
            {children}
        </CameraContext.Provider>
    );
}

// ============================================
// SCREEN SHAKE COMPONENT
// ============================================

export interface ScreenShakeProps {
    /** Shake intensity in pixels */
    intensity?: number;
    /** Shake duration in seconds */
    duration?: number;
    /** Trigger shake when this changes to true */
    trigger?: boolean;
}

/**
 * Screen shake effect component.
 * Use with Camera or standalone.
 * 
 * @example
 * ```tsx
 * <ScreenShake trigger={explosionOccurred} intensity={15} duration={0.5} />
 * ```
 */
export function ScreenShake({ intensity = 10, duration = 0.3, trigger = false }: ScreenShakeProps) {
    const camera = useCamera();
    const lastTrigger = useRef(false);

    useEffect(() => {
        if (trigger && !lastTrigger.current) {
            camera.shake(intensity, duration);
        }
        lastTrigger.current = trigger;
    }, [trigger, intensity, duration, camera]);

    return null;
}

export default Camera;
