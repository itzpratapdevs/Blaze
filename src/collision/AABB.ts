import { Vector2 } from '../math/Vector2';
import { Rect } from '../math/Rect';
import type { Sprite } from '../rendering/Sprite';

/**
 * Axis-Aligned Bounding Box for collision detection.
 * Uses min/max representation for efficient calculations.
 */
export class AABB {
    /**
     * Minimum point (top-left corner).
     */
    public min: Vector2;

    /**
     * Maximum point (bottom-right corner).
     */
    public max: Vector2;

    constructor(
        minX: number = 0,
        minY: number = 0,
        maxX: number = 0,
        maxY: number = 0
    ) {
        this.min = new Vector2(minX, minY);
        this.max = new Vector2(maxX, maxY);
    }

    // ===============================
    // Factory methods
    // ===============================

    /**
     * Create an AABB from a Rect.
     */
    static fromRect(rect: Rect): AABB {
        return new AABB(rect.x, rect.y, rect.x + rect.width, rect.y + rect.height);
    }

    /**
     * Create an AABB from a Sprite.
     * Accounts for anchor and scale.
     */
    static fromSprite(sprite: Sprite): AABB {
        const bounds = sprite.getBounds();
        return new AABB(bounds.left, bounds.top, bounds.right, bounds.bottom);
    }

    /**
     * Create an AABB from center and half-extents.
     */
    static fromCenterAndHalfExtents(
        centerX: number,
        centerY: number,
        halfWidth: number,
        halfHeight: number
    ): AABB {
        return new AABB(
            centerX - halfWidth,
            centerY - halfHeight,
            centerX + halfWidth,
            centerY + halfHeight
        );
    }

    /**
     * Create an AABB from position and size.
     */
    static fromPositionAndSize(
        x: number,
        y: number,
        width: number,
        height: number
    ): AABB {
        return new AABB(x, y, x + width, y + height);
    }

    // ===============================
    // Properties
    // ===============================

    /**
     * Get the width of the bounding box.
     */
    get width(): number {
        return this.max.x - this.min.x;
    }

    /**
     * Get the height of the bounding box.
     */
    get height(): number {
        return this.max.y - this.min.y;
    }

    /**
     * Get the center point.
     */
    center(): Vector2 {
        return new Vector2(
            (this.min.x + this.max.x) / 2,
            (this.min.y + this.max.y) / 2
        );
    }

    /**
     * Get the center X coordinate.
     */
    get centerX(): number {
        return (this.min.x + this.max.x) / 2;
    }

    /**
     * Get the center Y coordinate.
     */
    get centerY(): number {
        return (this.min.y + this.max.y) / 2;
    }

    /**
     * Get the half-extents (half size).
     */
    halfExtents(): Vector2 {
        return new Vector2(this.width / 2, this.height / 2);
    }

    /**
     * Get the area of the bounding box.
     */
    area(): number {
        return this.width * this.height;
    }

    /**
     * Get the perimeter of the bounding box.
     */
    perimeter(): number {
        return 2 * (this.width + this.height);
    }

    // ===============================
    // Intersection tests
    // ===============================

    /**
     * Check if this AABB intersects with another.
     */
    intersects(other: AABB): boolean {
        return (
            this.min.x < other.max.x &&
            this.max.x > other.min.x &&
            this.min.y < other.max.y &&
            this.max.y > other.min.y
        );
    }

    /**
     * Check if this AABB contains a point.
     */
    contains(point: Vector2): boolean {
        return (
            point.x >= this.min.x &&
            point.x <= this.max.x &&
            point.y >= this.min.y &&
            point.y <= this.max.y
        );
    }

    /**
     * Check if this AABB contains coordinates.
     */
    containsXY(x: number, y: number): boolean {
        return x >= this.min.x && x <= this.max.x && y >= this.min.y && y <= this.max.y;
    }

    /**
     * Check if this AABB fully contains another.
     */
    containsAABB(other: AABB): boolean {
        return (
            other.min.x >= this.min.x &&
            other.max.x <= this.max.x &&
            other.min.y >= this.min.y &&
            other.max.y <= this.max.y
        );
    }

    /**
     * Check if this AABB intersects with a circle.
     */
    intersectsCircle(centerX: number, centerY: number, radius: number): boolean {
        // Find the closest point on the AABB to the circle center
        const closestX = Math.max(this.min.x, Math.min(centerX, this.max.x));
        const closestY = Math.max(this.min.y, Math.min(centerY, this.max.y));

        // Check if the closest point is within the circle
        const dx = centerX - closestX;
        const dy = centerY - closestY;
        return dx * dx + dy * dy <= radius * radius;
    }

    // ===============================
    // Collision resolution
    // ===============================

    /**
     * Get the overlap with another AABB.
     * Returns null if no overlap.
     */
    getOverlap(other: AABB): Vector2 | null {
        if (!this.intersects(other)) return null;

        const overlapX = Math.min(this.max.x, other.max.x) - Math.max(this.min.x, other.min.x);
        const overlapY = Math.min(this.max.y, other.max.y) - Math.max(this.min.y, other.min.y);

        return new Vector2(overlapX, overlapY);
    }

    /**
     * Get the minimum translation vector to separate from another AABB.
     * Returns the smallest vector to move this AABB so it no longer overlaps.
     */
    getMTV(other: AABB): Vector2 | null {
        if (!this.intersects(other)) return null;

        const overlapLeft = this.max.x - other.min.x;
        const overlapRight = other.max.x - this.min.x;
        const overlapTop = this.max.y - other.min.y;
        const overlapBottom = other.max.y - this.min.y;

        // Find minimum overlap
        const minOverlapX = overlapLeft < overlapRight ? -overlapLeft : overlapRight;
        const minOverlapY = overlapTop < overlapBottom ? -overlapTop : overlapBottom;

        // Return the smaller of the two
        if (Math.abs(minOverlapX) < Math.abs(minOverlapY)) {
            return new Vector2(minOverlapX, 0);
        } else {
            return new Vector2(0, minOverlapY);
        }
    }

    // ===============================
    // Modifications
    // ===============================

    /**
     * Set the AABB from min/max values.
     */
    set(minX: number, minY: number, maxX: number, maxY: number): this {
        this.min.set(minX, minY);
        this.max.set(maxX, maxY);
        return this;
    }

    /**
     * Copy values from another AABB.
     */
    copy(other: AABB): this {
        this.min.copy(other.min);
        this.max.copy(other.max);
        return this;
    }

    /**
     * Clone this AABB.
     */
    clone(): AABB {
        return new AABB(this.min.x, this.min.y, this.max.x, this.max.y);
    }

    /**
     * Expand this AABB by a margin on all sides.
     */
    expand(margin: number): this {
        this.min.x -= margin;
        this.min.y -= margin;
        this.max.x += margin;
        this.max.y += margin;
        return this;
    }

    /**
     * Translate (move) this AABB.
     */
    translate(x: number, y: number): this {
        this.min.x += x;
        this.min.y += y;
        this.max.x += x;
        this.max.y += y;
        return this;
    }

    /**
     * Merge this AABB with another to create the union.
     */
    merge(other: AABB): this {
        this.min.x = Math.min(this.min.x, other.min.x);
        this.min.y = Math.min(this.min.y, other.min.y);
        this.max.x = Math.max(this.max.x, other.max.x);
        this.max.y = Math.max(this.max.y, other.max.y);
        return this;
    }

    /**
     * Update from a sprite.
     */
    updateFromSprite(sprite: Sprite): this {
        const bounds = sprite.getBounds();
        this.min.set(bounds.left, bounds.top);
        this.max.set(bounds.right, bounds.bottom);
        return this;
    }

    /**
     * Convert to Rect.
     */
    toRect(): Rect {
        return new Rect(this.min.x, this.min.y, this.width, this.height);
    }

    toString(): string {
        return `AABB(${this.min.x.toFixed(1)}, ${this.min.y.toFixed(1)} -> ${this.max.x.toFixed(1)}, ${this.max.y.toFixed(1)})`;
    }
}
