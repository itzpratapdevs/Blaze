import { Easing, EasingFunction } from './Easing';

/**
 * Tween state.
 */
export enum TweenState {
    Idle = 'idle',
    Running = 'running',
    Paused = 'paused',
    Complete = 'complete',
}

/**
 * Property values for tweening.
 */
type TweenableValue = number;
type TweenableProps = Record<string, TweenableValue>;

/**
 * Tween configuration.
 */
export interface TweenConfig {
    /**
     * Duration in seconds.
     */
    duration: number;

    /**
     * Easing function.
     */
    easing?: EasingFunction;

    /**
     * Delay before starting.
     */
    delay?: number;

    /**
     * Repeat count (0 = no repeat).
     */
    repeat?: number;

    /**
     * Yoyo (reverse on each repeat).
     */
    yoyo?: boolean;

    /**
     * Called each update.
     */
    onUpdate?: () => void;

    /**
     * Called when complete.
     */
    onComplete?: () => void;

    /**
     * Called on each repeat.
     */
    onRepeat?: () => void;
}

/**
 * Tween class for animating object properties.
 *
 * @example
 * ```typescript
 * // Move sprite from x=0 to x=100 over 1 second
 * const tween = new Tween(sprite, { x: 100 }, {
 *   duration: 1.0,
 *   easing: Easing.easeOutQuad,
 *   onComplete: () => console.log('Done!'),
 * });
 *
 * tween.start();
 *
 * // In update loop
 * tween.update(dt);
 * ```
 */
export class Tween<T extends object> {
    private _target: T;
    private _properties: Partial<Record<keyof T, TweenableValue>>;
    private _startValues: Partial<Record<keyof T, TweenableValue>> = {};
    private _changeValues: Partial<Record<keyof T, TweenableValue>> = {};

    private _duration: number;
    private _easing: EasingFunction;
    private _delay: number;
    private _repeat: number;
    private _yoyo: boolean;

    private _elapsed: number = 0;
    private _delayElapsed: number = 0;
    private _state: TweenState = TweenState.Idle;
    private _repeatCount: number = 0;
    private _reversed: boolean = false;

    private _onUpdate?: () => void;
    private _onComplete?: () => void;
    private _onRepeat?: () => void;

    constructor(
        target: T,
        properties: Partial<Record<keyof T, TweenableValue>>,
        config: TweenConfig
    ) {
        this._target = target;
        this._properties = properties;
        this._duration = config.duration;
        this._easing = config.easing ?? Easing.linear;
        this._delay = config.delay ?? 0;
        this._repeat = config.repeat ?? 0;
        this._yoyo = config.yoyo ?? false;
        this._onUpdate = config.onUpdate;
        this._onComplete = config.onComplete;
        this._onRepeat = config.onRepeat;
    }

    // ===============================
    // State
    // ===============================

    get state(): TweenState {
        return this._state;
    }

    get isRunning(): boolean {
        return this._state === TweenState.Running;
    }

    get isComplete(): boolean {
        return this._state === TweenState.Complete;
    }

    get progress(): number {
        return Math.min(1, this._elapsed / this._duration);
    }

    get elapsed(): number {
        return this._elapsed;
    }

    // ===============================
    // Control
    // ===============================

    /**
     * Start the tween.
     */
    start(): this {
        if (this._state === TweenState.Complete) {
            this.reset();
        }

        // Capture start values
        this._startValues = {};
        this._changeValues = {};

        for (const key of Object.keys(this._properties) as (keyof T)[]) {
            const startValue = (this._target as any)[key] as TweenableValue;
            const endValue = this._properties[key]!;

            this._startValues[key] = startValue;
            this._changeValues[key] = endValue - startValue;
        }

        this._state = TweenState.Running;
        return this;
    }

    /**
     * Pause the tween.
     */
    pause(): this {
        if (this._state === TweenState.Running) {
            this._state = TweenState.Paused;
        }
        return this;
    }

    /**
     * Resume after pause.
     */
    resume(): this {
        if (this._state === TweenState.Paused) {
            this._state = TweenState.Running;
        }
        return this;
    }

    /**
     * Cancel the tween.
     */
    cancel(): this {
        this._state = TweenState.Idle;
        return this;
    }

    /**
     * Reset the tween.
     */
    reset(): this {
        this._elapsed = 0;
        this._delayElapsed = 0;
        this._repeatCount = 0;
        this._reversed = false;
        this._state = TweenState.Idle;
        return this;
    }

    /**
     * Complete immediately, jumping to end values.
     */
    complete(): this {
        this._applyValues(1);
        this._state = TweenState.Complete;
        this._onComplete?.();
        return this;
    }

    // ===============================
    // Update
    // ===============================

    /**
     * Update the tween.
     * Call this every frame with delta time.
     */
    update(dt: number): void {
        if (this._state !== TweenState.Running) {
            return;
        }

        // Handle delay
        if (this._delayElapsed < this._delay) {
            this._delayElapsed += dt;
            return;
        }

        this._elapsed += dt;

        // Calculate progress
        let progress = Math.min(1, this._elapsed / this._duration);

        // Apply easing
        let easedProgress = this._easing(progress);

        // Handle yoyo
        if (this._reversed) {
            easedProgress = 1 - easedProgress;
        }

        // Apply values
        this._applyValues(easedProgress);
        this._onUpdate?.();

        // Check completion
        if (progress >= 1) {
            if (this._repeat > 0 && this._repeatCount < this._repeat) {
                this._repeatCount++;
                this._elapsed = 0;

                if (this._yoyo) {
                    this._reversed = !this._reversed;
                }

                this._onRepeat?.();
            } else {
                this._state = TweenState.Complete;
                this._onComplete?.();
            }
        }
    }

    /**
     * Apply interpolated values to target.
     */
    private _applyValues(progress: number): void {
        for (const key of Object.keys(this._properties) as (keyof T)[]) {
            const start = this._startValues[key]!;
            const change = this._changeValues[key]!;
            (this._target as any)[key] = start + change * progress;
        }
    }

    // ===============================
    // Chaining methods
    // ===============================

    onUpdate(callback: () => void): this {
        this._onUpdate = callback;
        return this;
    }

    onComplete(callback: () => void): this {
        this._onComplete = callback;
        return this;
    }

    onRepeat(callback: () => void): this {
        this._onRepeat = callback;
        return this;
    }

    // ===============================
    // Static factory methods
    // ===============================

    /**
     * Create a tween to target values.
     */
    static to<T extends object>(
        target: T,
        properties: Partial<Record<keyof T, TweenableValue>>,
        duration: number,
        easing?: EasingFunction
    ): Tween<T> {
        return new Tween(target, properties, { duration, easing });
    }

    /**
     * Create a tween from current to target values.
     */
    static from<T extends object>(
        target: T,
        properties: Partial<Record<keyof T, TweenableValue>>,
        duration: number,
        easing?: EasingFunction
    ): Tween<T> {
        // Swap start and end values
        const currentValues: Partial<Record<keyof T, TweenableValue>> = {};
        const startValues: Partial<Record<keyof T, TweenableValue>> = {};

        for (const key of Object.keys(properties) as (keyof T)[]) {
            currentValues[key] = (target as any)[key];
            startValues[key] = properties[key];
            (target as any)[key] = properties[key];
        }

        return new Tween(target, currentValues, { duration, easing });
    }

    toString(): string {
        return `Tween(${this._duration}s, ${this._state}, ${(this.progress * 100).toFixed(1)}%)`;
    }
}

/**
 * TweenManager for managing multiple tweens.
 */
export class TweenManager {
    private _tweens: Set<Tween<any>> = new Set();

    /**
     * Add a tween to be managed.
     */
    add<T extends object>(tween: Tween<T>): Tween<T> {
        this._tweens.add(tween);
        return tween;
    }

    /**
     * Create and add a tween.
     */
    to<T extends object>(
        target: T,
        properties: Partial<Record<keyof T, TweenableValue>>,
        duration: number,
        easing?: EasingFunction
    ): Tween<T> {
        const tween = Tween.to(target, properties, duration, easing);
        this.add(tween);
        tween.start();
        return tween;
    }

    /**
     * Remove a tween.
     */
    remove<T extends object>(tween: Tween<T>): boolean {
        return this._tweens.delete(tween);
    }

    /**
     * Update all tweens.
     */
    update(dt: number): void {
        for (const tween of this._tweens) {
            tween.update(dt);

            if (tween.isComplete) {
                this._tweens.delete(tween);
            }
        }
    }

    /**
     * Cancel all tweens.
     */
    cancelAll(): void {
        for (const tween of this._tweens) {
            tween.cancel();
        }
        this._tweens.clear();
    }

    /**
     * Get the number of active tweens.
     */
    get count(): number {
        return this._tweens.size;
    }
}
