import { Vector2 } from './Vector2';

/**
 * Rectangle class for bounds and collision detection.
 */
export class Rect {
    public x: number;
    public y: number;
    public width: number;
    public height: number;

    constructor(x: number = 0, y: number = 0, width: number = 0, height: number = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    /**
     * Set all properties.
     * Mutates this rect.
     */
    set(x: number, y: number, width: number, height: number): this {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        return this;
    }

    /**
     * Copy values from another rect.
     * Mutates this rect.
     */
    copy(rect: Rect): this {
        this.x = rect.x;
        this.y = rect.y;
        this.width = rect.width;
        this.height = rect.height;
        return this;
    }

    /**
     * Create a clone of this rect.
     */
    clone(): Rect {
        return new Rect(this.x, this.y, this.width, this.height);
    }

    // ===============================
    // Computed properties
    // ===============================

    get left(): number {
        return this.x;
    }

    get right(): number {
        return this.x + this.width;
    }

    get top(): number {
        return this.y;
    }

    get bottom(): number {
        return this.y + this.height;
    }

    get centerX(): number {
        return this.x + this.width / 2;
    }

    get centerY(): number {
        return this.y + this.height / 2;
    }

    /**
     * Get the center point of this rect.
     * Allocates a new Vector2.
     */
    center(): Vector2 {
        return new Vector2(this.centerX, this.centerY);
    }

    /**
     * Get the center point into an existing vector.
     * No allocation.
     */
    centerInto(out: Vector2): Vector2 {
        out.x = this.centerX;
        out.y = this.centerY;
        return out;
    }

    /**
     * Get the size as a vector.
     * Allocates a new Vector2.
     */
    size(): Vector2 {
        return new Vector2(this.width, this.height);
    }

    /**
     * Get the top-left corner.
     */
    topLeft(): Vector2 {
        return new Vector2(this.x, this.y);
    }

    /**
     * Get the top-right corner.
     */
    topRight(): Vector2 {
        return new Vector2(this.right, this.y);
    }

    /**
     * Get the bottom-left corner.
     */
    bottomLeft(): Vector2 {
        return new Vector2(this.x, this.bottom);
    }

    /**
     * Get the bottom-right corner.
     */
    bottomRight(): Vector2 {
        return new Vector2(this.right, this.bottom);
    }

    // ===============================
    // Intersection / containment
    // ===============================

    /**
     * Check if this rect contains a point.
     */
    contains(point: Vector2): boolean {
        return (
            point.x >= this.x &&
            point.x <= this.right &&
            point.y >= this.y &&
            point.y <= this.bottom
        );
    }

    /**
     * Check if this rect contains coordinates.
     */
    containsXY(x: number, y: number): boolean {
        return x >= this.x && x <= this.right && y >= this.y && y <= this.bottom;
    }

    /**
     * Check if this rect fully contains another rect.
     */
    containsRect(rect: Rect): boolean {
        return (
            rect.x >= this.x &&
            rect.right <= this.right &&
            rect.y >= this.y &&
            rect.bottom <= this.bottom
        );
    }

    /**
     * Check if this rect intersects with another rect.
     */
    intersects(rect: Rect): boolean {
        return (
            this.x < rect.right &&
            this.right > rect.x &&
            this.y < rect.bottom &&
            this.bottom > rect.y
        );
    }

    /**
     * Get the intersection of this rect with another.
     * Returns null if they don't intersect.
     */
    intersection(rect: Rect): Rect | null {
        const x = Math.max(this.x, rect.x);
        const y = Math.max(this.y, rect.y);
        const right = Math.min(this.right, rect.right);
        const bottom = Math.min(this.bottom, rect.bottom);

        if (right > x && bottom > y) {
            return new Rect(x, y, right - x, bottom - y);
        }
        return null;
    }

    // ===============================
    // Transformations
    // ===============================

    /**
     * Expand this rect by a given amount on all sides.
     * Mutates this rect.
     */
    expand(amount: number): this {
        this.x -= amount;
        this.y -= amount;
        this.width += amount * 2;
        this.height += amount * 2;
        return this;
    }

    /**
     * Translate this rect by a vector.
     * Mutates this rect.
     */
    translate(v: Vector2): this {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    /**
     * Translate this rect by x, y values.
     * Mutates this rect.
     */
    translateXY(x: number, y: number): this {
        this.x += x;
        this.y += y;
        return this;
    }

    /**
     * Scale this rect from its center.
     * Mutates this rect.
     */
    scale(factor: number): this {
        const cx = this.centerX;
        const cy = this.centerY;
        this.width *= factor;
        this.height *= factor;
        this.x = cx - this.width / 2;
        this.y = cy - this.height / 2;
        return this;
    }

    /**
     * Compute the union of this rect with another.
     * Returns the smallest rect containing both.
     */
    union(rect: Rect): Rect {
        const x = Math.min(this.x, rect.x);
        const y = Math.min(this.y, rect.y);
        const right = Math.max(this.right, rect.right);
        const bottom = Math.max(this.bottom, rect.bottom);
        return new Rect(x, y, right - x, bottom - y);
    }

    /**
     * Check if this rect equals another.
     */
    equals(rect: Rect): boolean {
        return (
            this.x === rect.x &&
            this.y === rect.y &&
            this.width === rect.width &&
            this.height === rect.height
        );
    }

    toString(): string {
        return `Rect(${this.x}, ${this.y}, ${this.width}, ${this.height})`;
    }

    // ===============================
    // Static factory methods
    // ===============================

    /**
     * Create a rect from center point and size.
     */
    static fromCenter(centerX: number, centerY: number, width: number, height: number): Rect {
        return new Rect(centerX - width / 2, centerY - height / 2, width, height);
    }

    /**
     * Create a rect from two corner points.
     */
    static fromPoints(p1: Vector2, p2: Vector2): Rect {
        const x = Math.min(p1.x, p2.x);
        const y = Math.min(p1.y, p2.y);
        const width = Math.abs(p2.x - p1.x);
        const height = Math.abs(p2.y - p1.y);
        return new Rect(x, y, width, height);
    }

    /**
     * Create a rect from min/max coordinates.
     */
    static fromMinMax(minX: number, minY: number, maxX: number, maxY: number): Rect {
        return new Rect(minX, minY, maxX - minX, maxY - minY);
    }
}
