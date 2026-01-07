import React, { createContext, useContext, useRef, useEffect } from 'react';
import { Sprite as SpriteClass, SpriteOptions } from '../rendering/Sprite';

/**
 * Sprite context for render collection.
 */
interface SpriteContextValue {
    register: (sprite: SpriteClass) => void;
    unregister: (sprite: SpriteClass) => void;
}

const SpriteContext = createContext<SpriteContextValue | null>(null);

/**
 * Props for Sprite component.
 */
export interface SpriteProps {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
    scaleX?: number;
    scaleY?: number;
    opacity?: number;
    zIndex?: number;
    flipX?: boolean;
    flipY?: boolean;
    anchorX?: number;
    anchorY?: number;
    tint?: string;
    visible?: boolean;
    children?: React.ReactNode;
}

/**
 * Sprite component for rendering game objects.
 */
export function Sprite(props: SpriteProps) {
    const context = useContext(SpriteContext);
    const spriteRef = useRef<SpriteClass | null>(null);

    // Create sprite instance once
    if (!spriteRef.current) {
        spriteRef.current = new SpriteClass({
            x: props.x,
            y: props.y,
            width: props.width,
            height: props.height,
            rotation: props.rotation,
            scaleX: props.scaleX,
            scaleY: props.scaleY,
            opacity: props.opacity,
            zIndex: props.zIndex,
            flipX: props.flipX,
            flipY: props.flipY,
            visible: props.visible,
        });
    }

    const sprite = spriteRef.current;

    // Update sprite properties when props change
    useEffect(() => {
        sprite.x = props.x;
        sprite.y = props.y;
        sprite.width = props.width;
        sprite.height = props.height;
        if (props.rotation !== undefined) sprite.rotation = props.rotation;
        if (props.scaleX !== undefined) sprite.scaleX = props.scaleX;
        if (props.scaleY !== undefined) sprite.scaleY = props.scaleY;
        if (props.opacity !== undefined) sprite.opacity = props.opacity;
        if (props.zIndex !== undefined) sprite.zIndex = props.zIndex;
        if (props.flipX !== undefined) sprite.flipX = props.flipX;
        if (props.flipY !== undefined) sprite.flipY = props.flipY;
        if (props.visible !== undefined) sprite.visible = props.visible;
        if (props.tint !== undefined) sprite.setTint(props.tint);
        if (props.anchorX !== undefined || props.anchorY !== undefined) {
            sprite.setAnchor(props.anchorX ?? 0, props.anchorY ?? 0);
        }
    }, [
        sprite,
        props.x,
        props.y,
        props.width,
        props.height,
        props.rotation,
        props.scaleX,
        props.scaleY,
        props.opacity,
        props.zIndex,
        props.flipX,
        props.flipY,
        props.visible,
        props.tint,
        props.anchorX,
        props.anchorY,
    ]);

    // Register with context
    useEffect(() => {
        if (context && sprite) {
            context.register(sprite);
            return () => context.unregister(sprite);
        }
        return undefined;
    }, [context, sprite]);

    return <>{props.children}</>;
}

/**
 * Provider for sprite rendering context.
 */
export function SpriteProvider({
    children,
    onSpritesChange,
}: {
    children: React.ReactNode;
    onSpritesChange?: (sprites: SpriteClass[]) => void;
}) {
    const spritesRef = useRef<Set<SpriteClass>>(new Set());

    const register = (sprite: SpriteClass) => {
        spritesRef.current.add(sprite);
        onSpritesChange?.(Array.from(spritesRef.current));
    };

    const unregister = (sprite: SpriteClass) => {
        spritesRef.current.delete(sprite);
        onSpritesChange?.(Array.from(spritesRef.current));
    };

    return (
        <SpriteContext.Provider value={{ register, unregister }}>
            {children}
        </SpriteContext.Provider>
    );
}

/**
 * Hook to get sprite ref for imperative access.
 */
export function useSpriteRef() {
    const spriteRef = useRef<SpriteClass | null>(null);

    const createSprite = (options: SpriteOptions): SpriteClass => {
        spriteRef.current = new SpriteClass(options);
        return spriteRef.current;
    };

    return { sprite: spriteRef.current, createSprite };
}
