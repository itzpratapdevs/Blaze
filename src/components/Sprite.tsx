import React, { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import { useGame } from './BlazeGame';

// ============================================
// SPRITE COMPONENT
// ============================================

export interface SpriteProps {
    /** Image source URL */
    src: string;
    /** X position */
    x: number;
    /** Y position */
    y: number;
    /** Width (defaults to image width) */
    width?: number;
    /** Height (defaults to image height) */
    height?: number;
    /** Anchor point (0-1), default { x: 0.5, y: 0.5 } */
    anchor?: { x: number; y: number };
    /** Rotation in radians */
    rotation?: number;
    /** Scale (uniform or { x, y }) */
    scale?: number | { x: number; y: number };
    /** Opacity (0-1) */
    opacity?: number;
    /** Flip horizontally */
    flipX?: boolean;
    /** Flip vertically */
    flipY?: boolean;
    /** Render priority (higher = on top) */
    priority?: number;
    /** Called every frame with delta time */
    onUpdate?: (dt: number, sprite: SpriteRef) => void;
    /** Called when image loads */
    onLoad?: () => void;
    /** Called on click/tap */
    onClick?: () => void;
}

export interface SpriteRef {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    scale: { x: number; y: number };
    opacity: number;
    readonly bounds: { left: number; top: number; right: number; bottom: number };
}

/**
 * Sprite component for rendering images on the game canvas.
 * 
 * @example
 * ```tsx
 * <Sprite src="/player.png" x={100} y={200} />
 * ```
 */
export const Sprite = forwardRef<SpriteRef, SpriteProps>(function Sprite(props, ref) {
    const {
        src,
        x: initialX,
        y: initialY,
        width: propWidth,
        height: propHeight,
        anchor = { x: 0.5, y: 0.5 },
        rotation: propRotation = 0,
        scale: propScale = 1,
        opacity: propOpacity = 1,
        flipX = false,
        flipY = false,
        onUpdate,
        onLoad,
    } = props;

    const { ctx, onUpdate: registerUpdate } = useGame();
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [loaded, setLoaded] = useState(false);

    // Mutable state for performance
    const state = useRef({
        x: initialX,
        y: initialY,
        rotation: propRotation,
        scale: typeof propScale === 'number' ? { x: propScale, y: propScale } : propScale,
        opacity: propOpacity,
    });

    // Update state from props
    useEffect(() => {
        state.current.x = initialX;
        state.current.y = initialY;
    }, [initialX, initialY]);

    useEffect(() => {
        state.current.rotation = propRotation;
    }, [propRotation]);

    useEffect(() => {
        state.current.scale = typeof propScale === 'number' ? { x: propScale, y: propScale } : propScale;
    }, [propScale]);

    useEffect(() => {
        state.current.opacity = propOpacity;
    }, [propOpacity]);

    // Load image
    useEffect(() => {
        const img = new Image();
        img.onload = () => {
            imageRef.current = img;
            setLoaded(true);
            onLoad?.();
        };
        img.src = src;
    }, [src, onLoad]);

    // Create sprite ref
    const spriteRef = useRef<SpriteRef>({
        get x() { return state.current.x; },
        set x(v) { state.current.x = v; },
        get y() { return state.current.y; },
        set y(v) { state.current.y = v; },
        get width() { return propWidth || imageRef.current?.width || 0; },
        get height() { return propHeight || imageRef.current?.height || 0; },
        get rotation() { return state.current.rotation; },
        set rotation(v) { state.current.rotation = v; },
        get scale() { return state.current.scale; },
        set scale(v) { state.current.scale = v; },
        get opacity() { return state.current.opacity; },
        set opacity(v) { state.current.opacity = v; },
        get bounds() {
            const w = propWidth || imageRef.current?.width || 0;
            const h = propHeight || imageRef.current?.height || 0;
            const ax = anchor.x * w;
            const ay = anchor.y * h;
            return {
                left: state.current.x - ax,
                top: state.current.y - ay,
                right: state.current.x - ax + w,
                bottom: state.current.y - ay + h,
            };
        },
    });

    // Expose ref
    useImperativeHandle(ref, () => spriteRef.current, []);

    // Render loop
    useEffect(() => {
        if (!ctx) return;

        return registerUpdate((dt) => {
            // Call user update
            onUpdate?.(dt, spriteRef.current);

            // Render sprite
            if (!loaded || !imageRef.current) return;

            const img = imageRef.current;
            const w = propWidth || img.width;
            const h = propHeight || img.height;
            const s = state.current;

            ctx.save();

            // Position and anchor
            ctx.translate(s.x, s.y);

            // Rotation
            if (s.rotation !== 0) {
                ctx.rotate(s.rotation);
            }

            // Scale & flip
            const scaleX = s.scale.x * (flipX ? -1 : 1);
            const scaleY = s.scale.y * (flipY ? -1 : 1);
            if (scaleX !== 1 || scaleY !== 1) {
                ctx.scale(scaleX, scaleY);
            }

            // Opacity
            if (s.opacity !== 1) {
                ctx.globalAlpha = s.opacity;
            }

            // Draw image centered on anchor
            ctx.drawImage(img, -w * anchor.x, -h * anchor.y, w, h);

            ctx.restore();
        });
    }, [ctx, loaded, registerUpdate, propWidth, propHeight, anchor, flipX, flipY, onUpdate]);

    return null; // Renders to canvas, not DOM
});

// ============================================
// ANIMATED SPRITE
// ============================================

export interface AnimatedSpriteProps extends Omit<SpriteProps, 'src'> {
    /** Array of frame image URLs */
    frames: string[];
    /** Frames per second */
    frameRate?: number;
    /** Loop the animation */
    loop?: boolean;
    /** Auto-start playing */
    autoPlay?: boolean;
    /** Called when animation completes (if not looping) */
    onComplete?: () => void;
}

export interface AnimatedSpriteRef extends SpriteRef {
    play: () => void;
    pause: () => void;
    stop: () => void;
    gotoFrame: (index: number) => void;
    currentFrame: number;
    isPlaying: boolean;
}

/**
 * Animated sprite component for sprite sheet animations.
 */
export const AnimatedSprite = forwardRef<AnimatedSpriteRef, AnimatedSpriteProps>(function AnimatedSprite(props, ref) {
    const {
        frames,
        frameRate = 12,
        loop = true,
        autoPlay = true,
        onComplete,
        ...spriteProps
    } = props;

    const [currentFrame, setCurrentFrame] = useState(0);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const frameTimeRef = useRef(0);
    const spriteRef = useRef<SpriteRef>(null);

    const frameDuration = 1 / frameRate;

    // Animation update
    const handleUpdate = useCallback((dt: number, sprite: SpriteRef) => {
        if (!isPlaying) return;

        frameTimeRef.current += dt;

        if (frameTimeRef.current >= frameDuration) {
            frameTimeRef.current -= frameDuration;

            setCurrentFrame(prev => {
                const next = prev + 1;
                if (next >= frames.length) {
                    if (loop) {
                        return 0;
                    } else {
                        setIsPlaying(false);
                        onComplete?.();
                        return prev;
                    }
                }
                return next;
            });
        }

        // Call original onUpdate
        spriteProps.onUpdate?.(dt, sprite);
    }, [isPlaying, frameDuration, frames.length, loop, onComplete, spriteProps.onUpdate]);

    // Expose controls
    useImperativeHandle(ref, () => ({
        ...(spriteRef.current as SpriteRef),
        play: () => setIsPlaying(true),
        pause: () => setIsPlaying(false),
        stop: () => {
            setIsPlaying(false);
            setCurrentFrame(0);
            frameTimeRef.current = 0;
        },
        gotoFrame: (index: number) => setCurrentFrame(Math.max(0, Math.min(index, frames.length - 1))),
        currentFrame,
        isPlaying,
    }), [currentFrame, isPlaying, frames.length]);

    return (
        <Sprite
            {...spriteProps}
            ref={spriteRef}
            src={frames[currentFrame]}
            onUpdate={handleUpdate}
        />
    );
});

export default Sprite;
