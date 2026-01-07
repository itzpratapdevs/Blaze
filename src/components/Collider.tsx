import React, { createContext, useContext, useRef, useEffect, useState } from 'react';
import { AABB } from '../collision/AABB';
import { Circle } from '../collision/Circle';
import { Vector2 } from '../math/Vector2';

/**
 * Collision callback.
 */
export type CollisionCallback = (other: string, data: CollisionData) => void;

/**
 * Collision data.
 */
export interface CollisionData {
    otherId: string;
    mtv: Vector2;
}

/**
 * Collider context.
 */
interface ColliderContextValue {
    register: (id: string, bounds: AABB | Circle, callbacks: ColliderCallbacks) => void;
    unregister: (id: string) => void;
    update: (id: string, bounds: AABB | Circle) => void;
}

interface ColliderCallbacks {
    onEnter?: CollisionCallback;
    onStay?: CollisionCallback;
    onExit?: CollisionCallback;
}

const ColliderContext = createContext<ColliderContextValue | null>(null);

/**
 * Props for Collider component.
 */
export interface ColliderProps {
    /** Unique identifier */
    id: string;
    /** X position */
    x: number;
    /** Y position */
    y: number;
    /** Width (for AABB) */
    width?: number;
    /** Height (for AABB) */
    height?: number;
    /** Radius (for circle) */
    radius?: number;
    /** Collision layer */
    layer?: number;
    /** Collision mask */
    mask?: number;
    /** Is a trigger (no physics response) */
    isTrigger?: boolean;
    /** Called when collision starts */
    onEnter?: CollisionCallback;
    /** Called while colliding */
    onStay?: CollisionCallback;
    /** Called when collision ends */
    onExit?: CollisionCallback;
    /** Children */
    children?: React.ReactNode;
}

/**
 * Collider component for collision detection.
 *
 * @example
 * ```tsx
 * function Player() {
 *   return (
 *     <Collider
 *       id="player"
 *       x={100}
 *       y={200}
 *       width={32}
 *       height={32}
 *       onEnter={(other) => {
 *         if (other === 'enemy') {
 *           takeDamage();
 *         }
 *       }}
 *     >
 *       <Sprite x={100} y={200} width={32} height={32} />
 *     </Collider>
 *   );
 * }
 * ```
 */
export function Collider(props: ColliderProps) {
    const context = useContext(ColliderContext);

    // Create bounds
    const bounds = props.radius !== undefined
        ? Circle.fromCenterRadius(props.x, props.y, props.radius)
        : new AABB(props.x, props.y, props.x + (props.width ?? 0), props.y + (props.height ?? 0));

    // Register on mount
    useEffect(() => {
        if (context) {
            context.register(props.id, bounds, {
                onEnter: props.onEnter,
                onStay: props.onStay,
                onExit: props.onExit,
            });

            return () => context.unregister(props.id);
        }
    }, [context, props.id]);

    // Update bounds when position/size changes
    useEffect(() => {
        if (context) {
            const newBounds = props.radius !== undefined
                ? Circle.fromCenterRadius(props.x, props.y, props.radius)
                : new AABB(props.x, props.y, props.x + (props.width ?? 0), props.y + (props.height ?? 0));

            context.update(props.id, newBounds);
        }
    }, [context, props.id, props.x, props.y, props.width, props.height, props.radius]);

    return <>{props.children}</>;
}

/**
 * Collider provider for collision detection system.
 */
export function ColliderProvider({ children }: { children: React.ReactNode }) {
    const collidersRef = useRef<Map<string, { bounds: AABB | Circle; callbacks: ColliderCallbacks }>>(
        new Map()
    );
    const activeCollisionsRef = useRef<Set<string>>(new Set());

    const register = (id: string, bounds: AABB | Circle, callbacks: ColliderCallbacks) => {
        collidersRef.current.set(id, { bounds, callbacks });
    };

    const unregister = (id: string) => {
        collidersRef.current.delete(id);
    };

    const update = (id: string, bounds: AABB | Circle) => {
        const collider = collidersRef.current.get(id);
        if (collider) {
            collider.bounds = bounds;
        }
    };

    return (
        <ColliderContext.Provider value={{ register, unregister, update }}>
            {children}
        </ColliderContext.Provider>
    );
}

/**
 * Hook for simple collision check.
 */
export function useCollision(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number
) {
    const [collisions, setCollisions] = useState<string[]>([]);
    const boundsRef = useRef(new AABB(x, y, x + width, y + height));

    useEffect(() => {
        boundsRef.current = new AABB(x, y, x + width, y + height);
    }, [x, y, width, height]);

    return { collisions, bounds: boundsRef.current };
}
