// ============================================
// MATH UTILITIES
// ============================================

/**
 * 2D Vector operations (functional, no classes)
 */
export interface Vec2 {
    x: number;
    y: number;
}

export const Vector2 = {
    /** Create a new vector */
    create: (x = 0, y = 0): Vec2 => ({ x, y }),

    /** Zero vector */
    zero: (): Vec2 => ({ x: 0, y: 0 }),

    /** Unit vector pointing up */
    up: (): Vec2 => ({ x: 0, y: -1 }),

    /** Unit vector pointing down */
    down: (): Vec2 => ({ x: 0, y: 1 }),

    /** Unit vector pointing left */
    left: (): Vec2 => ({ x: -1, y: 0 }),

    /** Unit vector pointing right */
    right: (): Vec2 => ({ x: 1, y: 0 }),

    /** Add two vectors */
    add: (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y }),

    /** Subtract b from a */
    sub: (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y }),

    /** Multiply vector by scalar */
    mul: (v: Vec2, s: number): Vec2 => ({ x: v.x * s, y: v.y * s }),

    /** Divide vector by scalar */
    div: (v: Vec2, s: number): Vec2 => ({ x: v.x / s, y: v.y / s }),

    /** Dot product */
    dot: (a: Vec2, b: Vec2): number => a.x * b.x + a.y * b.y,

    /** Cross product (2D - returns scalar) */
    cross: (a: Vec2, b: Vec2): number => a.x * b.y - a.y * b.x,

    /** Vector length */
    length: (v: Vec2): number => Math.sqrt(v.x * v.x + v.y * v.y),

    /** Squared length (faster, no sqrt) */
    lengthSq: (v: Vec2): number => v.x * v.x + v.y * v.y,

    /** Normalize to unit vector */
    normalize: (v: Vec2): Vec2 => {
        const len = Vector2.length(v);
        if (len === 0) return { x: 0, y: 0 };
        return { x: v.x / len, y: v.y / len };
    },

    /** Distance between two points */
    distance: (a: Vec2, b: Vec2): number => Vector2.length(Vector2.sub(a, b)),

    /** Squared distance (faster) */
    distanceSq: (a: Vec2, b: Vec2): number => Vector2.lengthSq(Vector2.sub(a, b)),

    /** Angle of vector in radians */
    angle: (v: Vec2): number => Math.atan2(v.y, v.x),

    /** Angle between two vectors in radians */
    angleBetween: (a: Vec2, b: Vec2): number => {
        return Math.atan2(Vector2.cross(a, b), Vector2.dot(a, b));
    },

    /** Rotate vector by angle (radians) */
    rotate: (v: Vec2, angle: number): Vec2 => {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            x: v.x * cos - v.y * sin,
            y: v.x * sin + v.y * cos,
        };
    },

    /** Linear interpolation */
    lerp: (a: Vec2, b: Vec2, t: number): Vec2 => ({
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
    }),

    /** Create vector from angle and length */
    fromAngle: (angle: number, length = 1): Vec2 => ({
        x: Math.cos(angle) * length,
        y: Math.sin(angle) * length,
    }),

    /** Copy a vector */
    copy: (v: Vec2): Vec2 => ({ x: v.x, y: v.y }),

    /** Check if two vectors are equal */
    equals: (a: Vec2, b: Vec2, epsilon = 0.0001): boolean => {
        return Math.abs(a.x - b.x) < epsilon && Math.abs(a.y - b.y) < epsilon;
    },

    /** Clamp vector length */
    clampLength: (v: Vec2, maxLength: number): Vec2 => {
        const len = Vector2.length(v);
        if (len > maxLength) {
            return Vector2.mul(Vector2.normalize(v), maxLength);
        }
        return v;
    },

    /** Reflect vector off a surface with normal n */
    reflect: (v: Vec2, n: Vec2): Vec2 => {
        const d = 2 * Vector2.dot(v, n);
        return Vector2.sub(v, Vector2.mul(n, d));
    },
};

// ============================================
// RECTANGLE
// ============================================

export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export const Rectangle = {
    create: (x = 0, y = 0, width = 0, height = 0): Rect => ({ x, y, width, height }),

    /** Get center point */
    center: (r: Rect): Vec2 => ({ x: r.x + r.width / 2, y: r.y + r.height / 2 }),

    /** Get top-left point */
    topLeft: (r: Rect): Vec2 => ({ x: r.x, y: r.y }),

    /** Get bottom-right point */
    bottomRight: (r: Rect): Vec2 => ({ x: r.x + r.width, y: r.y + r.height }),

    /** Check if point is inside rectangle */
    contains: (r: Rect, p: Vec2): boolean => {
        return p.x >= r.x && p.x <= r.x + r.width && p.y >= r.y && p.y <= r.y + r.height;
    },

    /** Check if two rectangles overlap */
    overlaps: (a: Rect, b: Rect): boolean => {
        return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
    },

    /** Get intersection of two rectangles */
    intersection: (a: Rect, b: Rect): Rect | null => {
        const x = Math.max(a.x, b.x);
        const y = Math.max(a.y, b.y);
        const width = Math.min(a.x + a.width, b.x + b.width) - x;
        const height = Math.min(a.y + a.height, b.y + b.height) - y;

        if (width <= 0 || height <= 0) return null;
        return { x, y, width, height };
    },

    /** Expand rectangle by amount on all sides */
    expand: (r: Rect, amount: number): Rect => ({
        x: r.x - amount,
        y: r.y - amount,
        width: r.width + amount * 2,
        height: r.height + amount * 2,
    }),
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/** Clamp a value between min and max */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/** Linear interpolation */
export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

/** Inverse lerp - get t from value */
export function inverseLerp(a: number, b: number, value: number): number {
    return (value - a) / (b - a);
}

/** Map value from one range to another */
export function map(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
    return lerp(outMin, outMax, inverseLerp(inMin, inMax, value));
}

/** Convert degrees to radians */
export function degToRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/** Convert radians to degrees */
export function radToDeg(radians: number): number {
    return radians * (180 / Math.PI);
}

/** Random integer between min (inclusive) and max (inclusive) */
export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Random float between min and max */
export function randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

/** Random element from array */
export function randomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

/** Shuffle array in place */
export function shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/** Wrap value around a range */
export function wrap(value: number, min: number, max: number): number {
    const range = max - min;
    return ((((value - min) % range) + range) % range) + min;
}

/** Smooth step interpolation */
export function smoothstep(edge0: number, edge1: number, x: number): number {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
}

/** Check if value is approximately equal */
export function approxEqual(a: number, b: number, epsilon = 0.0001): boolean {
    return Math.abs(a - b) < epsilon;
}
