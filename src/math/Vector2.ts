/**
 * 2D Vector class for game math operations.
 * Optimized for minimal allocations - use mutating methods when possible.
 */
export class Vector2 {
    public x: number;
    public y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * Set both components.
     * Mutates this vector.
     */
    set(x: number, y: number): this {
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * Copy values from another vector.
     * Mutates this vector.
     */
    copy(v: Vector2): this {
        this.x = v.x;
        this.y = v.y;
        return this;
    }

    /**
     * Create a clone of this vector.
     * Allocates a new Vector2.
     */
    clone(): Vector2 {
        return new Vector2(this.x, this.y);
    }

    /**
     * Add another vector to this one.
     * Mutates this vector.
     */
    add(v: Vector2): this {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    /**
     * Add scalar values to this vector.
     * Mutates this vector.
     */
    addScalar(x: number, y: number): this {
        this.x += x;
        this.y += y;
        return this;
    }

    /**
     * Subtract another vector from this one.
     * Mutates this vector.
     */
    subtract(v: Vector2): this {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    /**
     * Multiply this vector by a scalar.
     * Mutates this vector.
     */
    multiply(scalar: number): this {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    /**
     * Multiply component-wise by another vector.
     * Mutates this vector.
     */
    multiplyVector(v: Vector2): this {
        this.x *= v.x;
        this.y *= v.y;
        return this;
    }

    /**
     * Divide this vector by a scalar.
     * Mutates this vector.
     */
    divide(scalar: number): this {
        if (scalar !== 0) {
            this.x /= scalar;
            this.y /= scalar;
        }
        return this;
    }

    /**
     * Normalize this vector (make it unit length).
     * Mutates this vector.
     */
    normalize(): this {
        const mag = this.magnitude();
        if (mag > 0) {
            this.divide(mag);
        }
        return this;
    }

    /**
     * Negate this vector.
     * Mutates this vector.
     */
    negate(): this {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }

    /**
     * Get the magnitude (length) of this vector.
     */
    magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * Get the squared magnitude (avoids sqrt).
     * Use for comparisons to avoid expensive sqrt.
     */
    magnitudeSquared(): number {
        return this.x * this.x + this.y * this.y;
    }

    /**
     * Calculate dot product with another vector.
     */
    dot(v: Vector2): number {
        return this.x * v.x + this.y * v.y;
    }

    /**
     * Calculate cross product (returns scalar for 2D).
     */
    cross(v: Vector2): number {
        return this.x * v.y - this.y * v.x;
    }

    /**
     * Calculate distance to another vector.
     */
    distance(v: Vector2): number {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calculate squared distance (avoids sqrt).
     */
    distanceSquared(v: Vector2): number {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return dx * dx + dy * dy;
    }

    /**
     * Linear interpolation towards another vector.
     * Mutates this vector.
     * @param v Target vector
     * @param t Interpolation factor (0-1)
     */
    lerp(v: Vector2, t: number): this {
        this.x += (v.x - this.x) * t;
        this.y += (v.y - this.y) * t;
        return this;
    }

    /**
     * Get the angle of this vector in radians.
     */
    angle(): number {
        return Math.atan2(this.y, this.x);
    }

    /**
     * Rotate this vector by an angle in radians.
     * Mutates this vector.
     */
    rotate(angle: number): this {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const x = this.x * cos - this.y * sin;
        const y = this.x * sin + this.y * cos;
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * Clamp this vector's magnitude to a maximum.
     * Mutates this vector.
     */
    clampMagnitude(max: number): this {
        const magSq = this.magnitudeSquared();
        if (magSq > max * max) {
            this.divide(Math.sqrt(magSq)).multiply(max);
        }
        return this;
    }

    /**
     * Check if this vector equals another (within epsilon).
     */
    equals(v: Vector2, epsilon: number = 0.0001): boolean {
        return Math.abs(this.x - v.x) < epsilon && Math.abs(this.y - v.y) < epsilon;
    }

    /**
     * Check if this is a zero vector.
     */
    isZero(): boolean {
        return this.x === 0 && this.y === 0;
    }

    toString(): string {
        return `Vector2(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
    }

    // ===============================
    // Static factory methods
    // ===============================

    static readonly ZERO = Object.freeze(new Vector2(0, 0));
    static readonly ONE = Object.freeze(new Vector2(1, 1));
    static readonly UP = Object.freeze(new Vector2(0, -1));
    static readonly DOWN = Object.freeze(new Vector2(0, 1));
    static readonly LEFT = Object.freeze(new Vector2(-1, 0));
    static readonly RIGHT = Object.freeze(new Vector2(1, 0));

    /**
     * Create a vector from an angle (in radians) and magnitude.
     */
    static fromAngle(angle: number, magnitude: number = 1): Vector2 {
        return new Vector2(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude);
    }

    /**
     * Create a random unit vector.
     */
    static random(): Vector2 {
        const angle = Math.random() * Math.PI * 2;
        return new Vector2(Math.cos(angle), Math.sin(angle));
    }

    /**
     * Add two vectors, returning a new vector.
     */
    static add(a: Vector2, b: Vector2): Vector2 {
        return new Vector2(a.x + b.x, a.y + b.y);
    }

    /**
     * Subtract two vectors, returning a new vector.
     */
    static subtract(a: Vector2, b: Vector2): Vector2 {
        return new Vector2(a.x - b.x, a.y - b.y);
    }

    /**
     * Linear interpolation between two vectors.
     */
    static lerp(a: Vector2, b: Vector2, t: number): Vector2 {
        return new Vector2(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
    }
}
