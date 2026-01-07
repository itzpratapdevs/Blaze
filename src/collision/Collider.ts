import { Component } from '../core/Component';
import { Vector2 } from '../math/Vector2';
import { AABB } from './AABB';
import type { Sprite } from '../rendering/Sprite';

/**
 * Collision layer for filtering.
 */
export type CollisionLayer = number;

/**
 * Predefined collision layers.
 */
export const CollisionLayers = {
    Default: 1,
    Player: 2,
    Enemy: 4,
    Projectile: 8,
    Pickup: 16,
    Environment: 32,
    Trigger: 64,
    All: 0xffffffff,
} as const;

/**
 * Collision callback data.
 */
export interface CollisionData {
    /**
     * The other collider.
     */
    other: Collider;

    /**
     * Minimum translation vector to separate.
     */
    mtv: Vector2;

    /**
     * Overlap amount.
     */
    overlap: Vector2;
}

/**
 * Collision callback type.
 */
export type CollisionCallback = (data: CollisionData) => void;

/**
 * Collider component for collision detection.
 *
 * Attach to entities that need collision detection.
 * The collider bounds can be manually set or synced from a Sprite.
 */
export class Collider extends Component {
    /**
     * The bounding box for collision detection.
     */
    public bounds: AABB;

    /**
     * Offset from the entity/sprite position.
     */
    public offset: Vector2;

    /**
     * Collision layer this collider belongs to.
     */
    public layer: CollisionLayer = CollisionLayers.Default;

    /**
     * Collision mask - layers this collider can collide with.
     */
    public mask: CollisionLayer = CollisionLayers.All;

    /**
     * Whether this is a trigger (no physical response).
     */
    public isTrigger: boolean = false;

    /**
     * Optional tag for identifying collider types.
     */
    public tag: string = '';

    // Callbacks
    private _onCollision: CollisionCallback | null = null;
    private _onTriggerEnter: CollisionCallback | null = null;
    private _onTriggerExit: CollisionCallback | null = null;

    // Tracking for trigger events
    private _currentTriggers: Set<Collider> = new Set();
    private _previousTriggers: Set<Collider> = new Set();

    constructor(
        width: number = 0,
        height: number = 0,
        offsetX: number = 0,
        offsetY: number = 0
    ) {
        super();
        this.bounds = new AABB(0, 0, width, height);
        this.offset = new Vector2(offsetX, offsetY);
    }

    // ===============================
    // Factory methods
    // ===============================

    /**
     * Create a collider from a Sprite.
     */
    static fromSprite(sprite: Sprite): Collider {
        const collider = new Collider(
            sprite.width * sprite.scaleX,
            sprite.height * sprite.scaleY
        );
        collider.updateFromSprite(sprite);
        return collider;
    }

    /**
     * Create a centered collider.
     */
    static centered(width: number, height: number): Collider {
        const collider = new Collider(width, height, -width / 2, -height / 2);
        return collider;
    }

    // ===============================
    // Size configuration
    // ===============================

    /**
     * Set the collider size.
     */
    setSize(width: number, height: number): this {
        this.bounds.max.set(this.bounds.min.x + width, this.bounds.min.y + height);
        return this;
    }

    /**
     * Set the collider offset.
     */
    setOffset(x: number, y: number): this {
        this.offset.set(x, y);
        return this;
    }

    /**
     * Get the width.
     */
    get width(): number {
        return this.bounds.width;
    }

    /**
     * Get the height.
     */
    get height(): number {
        return this.bounds.height;
    }

    // ===============================
    // Layer configuration
    // ===============================

    /**
     * Set collision layer.
     */
    setLayer(layer: CollisionLayer): this {
        this.layer = layer;
        return this;
    }

    /**
     * Set collision mask.
     */
    setMask(mask: CollisionLayer): this {
        this.mask = mask;
        return this;
    }

    /**
     * Check if this collider can collide with another.
     */
    canCollideWith(other: Collider): boolean {
        // Check if layers match masks (both ways)
        return (this.mask & other.layer) !== 0 && (other.mask & this.layer) !== 0;
    }

    // ===============================
    // Collision detection
    // ===============================

    /**
     * Check if this collider intersects with another.
     */
    intersects(other: Collider): boolean {
        if (!this.enabled || !other.enabled) return false;
        if (!this.canCollideWith(other)) return false;
        return this.bounds.intersects(other.bounds);
    }

    /**
     * Check if this collider contains a point.
     */
    containsPoint(x: number, y: number): boolean {
        return this.bounds.containsXY(x, y);
    }

    /**
     * Get the minimum translation vector to separate from another collider.
     */
    getMTV(other: Collider): Vector2 | null {
        if (!this.intersects(other)) return null;
        return this.bounds.getMTV(other.bounds);
    }

    /**
     * Get the overlap with another collider.
     */
    getOverlap(other: Collider): Vector2 | null {
        if (!this.intersects(other)) return null;
        return this.bounds.getOverlap(other.bounds);
    }

    // ===============================
    // Callbacks
    // ===============================

    /**
     * Set collision callback (called for non-trigger collisions).
     */
    onCollision(callback: CollisionCallback | null): this {
        this._onCollision = callback;
        return this;
    }

    /**
     * Set trigger enter callback.
     */
    onTriggerEnter(callback: CollisionCallback | null): this {
        this._onTriggerEnter = callback;
        return this;
    }

    /**
     * Set trigger exit callback.
     */
    onTriggerExit(callback: CollisionCallback | null): this {
        this._onTriggerExit = callback;
        return this;
    }

    // ===============================
    // Update
    // ===============================

    /**
     * Update bounds from a Sprite component.
     */
    updateFromSprite(sprite: Sprite): void {
        const anchorOffsetX = -sprite.width * sprite.anchor.x * sprite.scaleX;
        const anchorOffsetY = -sprite.height * sprite.anchor.y * sprite.scaleY;

        this.bounds.set(
            sprite.x + anchorOffsetX + this.offset.x,
            sprite.y + anchorOffsetY + this.offset.y,
            sprite.x + anchorOffsetX + this.offset.x + sprite.width * sprite.scaleX,
            sprite.y + anchorOffsetY + this.offset.y + sprite.height * sprite.scaleY
        );
    }

    /**
     * Update bounds from a position.
     */
    updateFromPosition(x: number, y: number): void {
        const width = this.bounds.width;
        const height = this.bounds.height;
        this.bounds.set(
            x + this.offset.x,
            y + this.offset.y,
            x + this.offset.x + width,
            y + this.offset.y + height
        );
    }

    /**
     * Process collision with another collider.
     * Handles callbacks and trigger tracking.
     * @internal
     */
    _processCollision(other: Collider): void {
        if (!this.intersects(other)) return;

        const mtv = this.bounds.getMTV(other.bounds);
        const overlap = this.bounds.getOverlap(other.bounds);

        if (!mtv || !overlap) return;

        const data: CollisionData = {
            other,
            mtv,
            overlap,
        };

        if (this.isTrigger || other.isTrigger) {
            // Track trigger state
            this._currentTriggers.add(other);

            // Check for new trigger entry
            if (!this._previousTriggers.has(other)) {
                this._onTriggerEnter?.(data);
            }
        } else {
            // Normal collision
            this._onCollision?.(data);
        }
    }

    /**
     * Update trigger tracking.
     * Should be called at the end of each collision detection pass.
     * @internal
     */
    _updateTriggers(): void {
        // Check for trigger exits
        for (const prev of this._previousTriggers) {
            if (!this._currentTriggers.has(prev)) {
                this._onTriggerExit?.({
                    other: prev,
                    mtv: Vector2.ZERO.clone(),
                    overlap: Vector2.ZERO.clone(),
                });
            }
        }

        // Swap sets
        this._previousTriggers = this._currentTriggers;
        this._currentTriggers = new Set();
    }

    /**
     * Clear trigger tracking.
     */
    clearTriggers(): void {
        this._currentTriggers.clear();
        this._previousTriggers.clear();
    }

    toString(): string {
        return `Collider(${this.bounds.toString()}, layer=${this.layer})`;
    }
}
