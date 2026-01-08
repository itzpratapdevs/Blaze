import { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '../components/BlazeGame';
import { useGameLoop } from './core';

// ============================================
// COLLISION TYPES
// ============================================

export interface Bounds {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

export interface CollisionInfo {
    /** The other entity that was collided with */
    other: Bounds & { tag?: string; data?: any };
    /** Overlap amount on X axis */
    overlapX: number;
    /** Overlap amount on Y axis */
    overlapY: number;
    /** Side of collision: 'left' | 'right' | 'top' | 'bottom' */
    side: 'left' | 'right' | 'top' | 'bottom';
}

// ============================================
// COLLISION CONTEXT
// ============================================

interface Collider {
    id: string;
    bounds: Bounds;
    tag?: string;
    data?: any;
    callback?: (info: CollisionInfo) => void;
    layer?: number;
    mask?: number;
}

const colliders = new Map<string, Collider>();
let colliderId = 0;

/**
 * Register a collider for collision detection.
 */
function registerCollider(collider: Omit<Collider, 'id'>): string {
    const id = `collider_${colliderId++}`;
    colliders.set(id, { ...collider, id });
    return id;
}

/**
 * Update a collider's bounds.
 */
function updateCollider(id: string, bounds: Bounds) {
    const collider = colliders.get(id);
    if (collider) {
        collider.bounds = bounds;
    }
}

/**
 * Unregister a collider.
 */
function unregisterCollider(id: string) {
    colliders.delete(id);
}

/**
 * Check AABB collision between two bounds.
 */
function checkAABB(a: Bounds, b: Bounds): boolean {
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

/**
 * Get collision info between two bounds.
 */
function getCollisionInfo(a: Bounds, b: Bounds, bData: { tag?: string; data?: any }): CollisionInfo {
    const overlapX = Math.min(a.right - b.left, b.right - a.left);
    const overlapY = Math.min(a.bottom - b.top, b.bottom - a.top);

    let side: 'left' | 'right' | 'top' | 'bottom';

    if (overlapX < overlapY) {
        side = a.left < b.left ? 'right' : 'left';
    } else {
        side = a.top < b.top ? 'bottom' : 'top';
    }

    return {
        other: { ...b, ...bData },
        overlapX,
        overlapY,
        side,
    };
}

// ============================================
// COLLISION HOOK
// ============================================

export interface UseCollisionOptions {
    /** Tag for this collider */
    tag?: string;
    /** Custom data to attach */
    data?: any;
    /** Collision layer (bitmask) */
    layer?: number;
    /** Which layers to collide with (bitmask) */
    mask?: number;
    /** Called on collision */
    onCollision?: (info: CollisionInfo) => void;
}

/**
 * Hook to register an entity for collision detection.
 * 
 * @example
 * ```tsx
 * function Player() {
 *   const [x, setX] = useState(100);
 *   const [y, setY] = useState(100);
 *   
 *   const bounds = useCollision(
 *     { left: x, top: y, right: x + 32, bottom: y + 32 },
 *     {
 *       tag: 'player',
 *       onCollision: (info) => {
 *         if (info.other.tag === 'enemy') {
 *           takeDamage();
 *         } else if (info.other.tag === 'coin') {
 *           collectCoin();
 *         }
 *       },
 *     }
 *   );
 *   
 *   return <Rectangle {...bounds} color="#00ff00" />;
 * }
 * ```
 */
export function useCollision(
    bounds: Bounds,
    options?: UseCollisionOptions
): Bounds {
    const { tag, data, layer = 1, mask = 0xFFFFFFFF, onCollision } = options || {};
    const colliderIdRef = useRef<string | null>(null);
    const boundsRef = useRef(bounds);

    // Register collider
    useEffect(() => {
        const id = registerCollider({
            bounds,
            tag,
            data,
            layer,
            mask,
            callback: onCollision,
        });
        colliderIdRef.current = id;

        return () => {
            if (colliderIdRef.current) {
                unregisterCollider(colliderIdRef.current);
            }
        };
    }, [tag, data, layer, mask]);

    // Update bounds
    useEffect(() => {
        boundsRef.current = bounds;
        if (colliderIdRef.current) {
            updateCollider(colliderIdRef.current, bounds);
        }
    }, [bounds]);

    // Update callback
    useEffect(() => {
        if (colliderIdRef.current) {
            const collider = colliders.get(colliderIdRef.current);
            if (collider) {
                collider.callback = onCollision;
            }
        }
    }, [onCollision]);

    return bounds;
}

// ============================================
// COLLISION SYSTEM
// ============================================

/**
 * Component that runs collision detection each frame.
 * Place this once in your game.
 * 
 * @example
 * ```tsx
 * <BlazeGame>
 *   <CollisionSystem />
 *   <Player />
 *   <Enemies />
 * </BlazeGame>
 * ```
 */
export function CollisionSystem() {
    useGameLoop(() => {
        const colliderArray = Array.from(colliders.values());

        for (let i = 0; i < colliderArray.length; i++) {
            const a = colliderArray[i];
            if (!a.callback) continue;

            for (let j = 0; j < colliderArray.length; j++) {
                if (i === j) continue;

                const b = colliderArray[j];

                // Check layer/mask
                if (a.mask !== undefined && b.layer !== undefined) {
                    if ((a.mask & b.layer) === 0) continue;
                }

                // Check collision
                if (checkAABB(a.bounds, b.bounds)) {
                    const info = getCollisionInfo(a.bounds, b.bounds, { tag: b.tag, data: b.data });
                    a.callback(info);
                }
            }
        }
    });

    return null;
}

// ============================================
// SIMPLE COLLISION CHECK
// ============================================

/**
 * Check if a point is inside bounds.
 */
export function pointInBounds(x: number, y: number, bounds: Bounds): boolean {
    return x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom;
}

/**
 * Check if two bounds overlap.
 */
export function boundsOverlap(a: Bounds, b: Bounds): boolean {
    return checkAABB(a, b);
}

/**
 * Check circle-circle collision.
 */
export function circleCollision(
    x1: number, y1: number, r1: number,
    x2: number, y2: number, r2: number
): boolean {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < r1 + r2;
}

/**
 * Check point-circle collision.
 */
export function pointInCircle(x: number, y: number, cx: number, cy: number, radius: number): boolean {
    const dx = x - cx;
    const dy = y - cy;
    return dx * dx + dy * dy <= radius * radius;
}
