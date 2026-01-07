/**
 * Easing function type.
 * Takes progress (0-1) and returns eased value (0-1).
 */
export type EasingFunction = (t: number) => number;

/**
 * Standard easing functions for animations.
 *
 * @example
 * ```typescript
 * const tween = new Tween(sprite, { x: 100 }, 1.0, Easing.easeOutQuad);
 * ```
 */
export const Easing = {
    // Linear
    linear: (t: number): number => t,

    // Quadratic
    easeInQuad: (t: number): number => t * t,
    easeOutQuad: (t: number): number => t * (2 - t),
    easeInOutQuad: (t: number): number =>
        t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,

    // Cubic
    easeInCubic: (t: number): number => t * t * t,
    easeOutCubic: (t: number): number => --t * t * t + 1,
    easeInOutCubic: (t: number): number =>
        t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

    // Quartic
    easeInQuart: (t: number): number => t * t * t * t,
    easeOutQuart: (t: number): number => 1 - --t * t * t * t,
    easeInOutQuart: (t: number): number =>
        t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,

    // Quintic
    easeInQuint: (t: number): number => t * t * t * t * t,
    easeOutQuint: (t: number): number => 1 + --t * t * t * t * t,
    easeInOutQuint: (t: number): number =>
        t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t,

    // Sine
    easeInSine: (t: number): number => 1 - Math.cos((t * Math.PI) / 2),
    easeOutSine: (t: number): number => Math.sin((t * Math.PI) / 2),
    easeInOutSine: (t: number): number => -(Math.cos(Math.PI * t) - 1) / 2,

    // Exponential
    easeInExpo: (t: number): number => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),
    easeOutExpo: (t: number): number => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    easeInOutExpo: (t: number): number => {
        if (t === 0) return 0;
        if (t === 1) return 1;
        return t < 0.5
            ? Math.pow(2, 20 * t - 10) / 2
            : (2 - Math.pow(2, -20 * t + 10)) / 2;
    },

    // Circular
    easeInCirc: (t: number): number => 1 - Math.sqrt(1 - t * t),
    easeOutCirc: (t: number): number => Math.sqrt(1 - --t * t),
    easeInOutCirc: (t: number): number =>
        t < 0.5
            ? (1 - Math.sqrt(1 - 4 * t * t)) / 2
            : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2,

    // Back (overshoot)
    easeInBack: (t: number): number => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return c3 * t * t * t - c1 * t * t;
    },
    easeOutBack: (t: number): number => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },
    easeInOutBack: (t: number): number => {
        const c1 = 1.70158;
        const c2 = c1 * 1.525;
        return t < 0.5
            ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
            : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
    },

    // Elastic
    easeInElastic: (t: number): number => {
        if (t === 0) return 0;
        if (t === 1) return 1;
        const c4 = (2 * Math.PI) / 3;
        return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
    },
    easeOutElastic: (t: number): number => {
        if (t === 0) return 0;
        if (t === 1) return 1;
        const c4 = (2 * Math.PI) / 3;
        return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },
    easeInOutElastic: (t: number): number => {
        if (t === 0) return 0;
        if (t === 1) return 1;
        const c5 = (2 * Math.PI) / 4.5;
        return t < 0.5
            ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
            : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
    },

    // Bounce
    easeInBounce: (t: number): number => 1 - Easing.easeOutBounce(1 - t),
    easeOutBounce: (t: number): number => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    },
    easeInOutBounce: (t: number): number =>
        t < 0.5
            ? (1 - Easing.easeOutBounce(1 - 2 * t)) / 2
            : (1 + Easing.easeOutBounce(2 * t - 1)) / 2,
};

/**
 * Get an easing function by name.
 */
export function getEasing(name: keyof typeof Easing): EasingFunction {
    return Easing[name];
}
