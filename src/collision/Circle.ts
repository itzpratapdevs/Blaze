import { Vector2 } from '../math/Vector2';
import { AABB } from './AABB';

/**
 * Circle collision shape.
 *
 * @example
 * ```typescript
 * const circle1 = new Circle(new Vector2(100, 100), 25);
 * const circle2 = Circle.fromCenterRadius(200, 100, 25);
 *
 * if (circle1.intersectsCircle(circle2)) {
 *   console.log('Collision!');
 * }
 * ```
 */
export class Circle {
    /**
     * Center position.
     */
    public center: Vector2;

    /**
     * Radius.
     */
    public radius: number;

    constructor(center: Vector2 = new Vector2(), radius: number = 0) {
        this.center = center;
        this.radius = radius;
    }

    // ===============================
    // Factory methods
    // ===============================

    /**
     * Create a circle from center coordinates and radius.
     */
    static fromCenterRadius(x: number, y: number, radius: number): Circle {
        return new Circle(new Vector2(x, y), radius);
    }

    /**
     * Create a circle that encloses an AABB.
     */
    static fromAABB(aabb: AABB): Circle {
        const center = aabb.center();
        const radius = center.distance(aabb.min);
        return new Circle(center, radius);
    }

    // ===============================
    // Properties
    // ===============================

    get x(): number {
        return this.center.x;
    }

    set x(value: number) {
        this.center.x = value;
    }

    get y(): number {
        return this.center.y;
    }

    set y(value: number) {
        this.center.y = value;
    }

    get diameter(): number {
        return this.radius * 2;
    }

    get circumference(): number {
        return 2 * Math.PI * this.radius;
    }

    get area(): number {
        return Math.PI * this.radius * this.radius;
    }

    // ===============================
    // Position
    // ===============================

    /**
     * Set position.
     */
    setPosition(x: number, y: number): this {
        this.center.x = x;
        this.center.y = y;
        return this;
    }

    /**
     * Move by delta.
     */
    translate(dx: number, dy: number): this {
        this.center.x += dx;
        this.center.y += dy;
        return this;
    }

    // ===============================
    // Intersection tests
    // ===============================

    /**
     * Check if this circle contains a point.
     */
    containsPoint(point: Vector2): boolean {
        const dx = point.x - this.center.x;
        const dy = point.y - this.center.y;
        return dx * dx + dy * dy <= this.radius * this.radius;
    }

    /**
     * Check if this circle intersects another circle.
     */
    intersectsCircle(other: Circle): boolean {
        const dx = other.center.x - this.center.x;
        const dy = other.center.y - this.center.y;
        const distSq = dx * dx + dy * dy;
        const radiusSum = this.radius + other.radius;
        return distSq < radiusSum * radiusSum;
    }

    /**
     * Check if this circle intersects an AABB.
     */
    intersectsAABB(aabb: AABB): boolean {
        // Find closest point on AABB to circle center
        const closestX = Math.max(aabb.min.x, Math.min(this.center.x, aabb.max.x));
        const closestY = Math.max(aabb.min.y, Math.min(this.center.y, aabb.max.y));

        // Check if closest point is inside circle
        const dx = this.center.x - closestX;
        const dy = this.center.y - closestY;
        return dx * dx + dy * dy < this.radius * this.radius;
    }

    /**
     * Get the distance to another circle.
     * Negative if overlapping.
     */
    distanceToCircle(other: Circle): number {
        const centerDist = this.center.distance(other.center);
        return centerDist - this.radius - other.radius;
    }

    /**
     * Get the overlap amount with another circle.
     * Returns 0 if not overlapping.
     */
    overlapWithCircle(other: Circle): number {
        const distance = this.distanceToCircle(other);
        return distance < 0 ? -distance : 0;
    }

    /**
     * Get minimum translation vector to separate from another circle.
     * Returns null if not intersecting.
     */
    getMTV(other: Circle): Vector2 | null {
        const dx = other.center.x - this.center.x;
        const dy = other.center.y - this.center.y;
        const distSq = dx * dx + dy * dy;
        const radiusSum = this.radius + other.radius;

        if (distSq >= radiusSum * radiusSum) {
            return null; // Not intersecting
        }

        const dist = Math.sqrt(distSq);

        if (dist === 0) {
            // Circles are at same center, push in arbitrary direction
            return new Vector2(radiusSum, 0);
        }

        const overlap = radiusSum - dist;
        const nx = dx / dist;
        const ny = dy / dist;

        return new Vector2(-nx * overlap, -ny * overlap);
    }

    // ===============================
    // Bounds
    // ===============================

    /**
     * Get the bounding AABB.
     */
    getBounds(): AABB {
        return new AABB(
            this.center.x - this.radius,
            this.center.y - this.radius,
            this.center.x + this.radius,
            this.center.y + this.radius
        );
    }

    // ===============================
    // Utilities
    // ===============================

    /**
     * Get a point on the circumference at the given angle (radians).
     */
    getPointOnCircumference(angle: number): Vector2 {
        return new Vector2(
            this.center.x + Math.cos(angle) * this.radius,
            this.center.y + Math.sin(angle) * this.radius
        );
    }

    /**
     * Clone this circle.
     */
    clone(): Circle {
        return new Circle(this.center.clone(), this.radius);
    }

    /**
     * Copy values from another circle.
     */
    copy(other: Circle): this {
        this.center.x = other.center.x;
        this.center.y = other.center.y;
        this.radius = other.radius;
        return this;
    }

    /**
     * Check equality.
     */
    equals(other: Circle): boolean {
        return (
            this.center.x === other.center.x &&
            this.center.y === other.center.y &&
            this.radius === other.radius
        );
    }

    toString(): string {
        return `Circle(${this.center.x.toFixed(2)}, ${this.center.y.toFixed(2)}, r=${this.radius.toFixed(2)})`;
    }
}
