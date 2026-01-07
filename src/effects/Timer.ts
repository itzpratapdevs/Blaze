/**
 * Timer callback function.
 */
export type TimerCallback = () => void;

/**
 * Timer state.
 */
export enum TimerState {
    Idle = 'idle',
    Running = 'running',
    Paused = 'paused',
    Complete = 'complete',
}

/**
 * Timer for delayed and repeating actions.
 *
 * @example
 * ```typescript
 * // One-shot timer
 * const timer = new Timer(2.0, () => {
 *   console.log('2 seconds passed!');
 * });
 * timer.start();
 *
 * // Repeating timer
 * const repeater = new Timer(0.5, () => {
 *   console.log('Every 0.5 seconds');
 * }, { repeat: true });
 *
 * // In update loop
 * timer.update(dt);
 * repeater.update(dt);
 * ```
 */
export class Timer {
    private _duration: number;
    private _callback: TimerCallback;
    private _repeat: boolean;
    private _repeatCount: number;

    private _elapsed: number = 0;
    private _state: TimerState = TimerState.Idle;
    private _timesTriggered: number = 0;

    /**
     * Create a timer.
     * @param duration Duration in seconds
     * @param callback Function to call when timer fires
     * @param options Timer options
     */
    constructor(
        duration: number,
        callback: TimerCallback,
        options: {
            repeat?: boolean;
            repeatCount?: number;
            autoStart?: boolean;
        } = {}
    ) {
        this._duration = duration;
        this._callback = callback;
        this._repeat = options.repeat ?? false;
        this._repeatCount = options.repeatCount ?? Infinity;

        if (options.autoStart) {
            this.start();
        }
    }

    // ===============================
    // State
    // ===============================

    get state(): TimerState {
        return this._state;
    }

    get isActive(): boolean {
        return this._state === TimerState.Running || this._state === TimerState.Paused;
    }

    get isRunning(): boolean {
        return this._state === TimerState.Running;
    }

    get isComplete(): boolean {
        return this._state === TimerState.Complete;
    }

    get elapsed(): number {
        return this._elapsed;
    }

    get remaining(): number {
        return Math.max(0, this._duration - this._elapsed);
    }

    get progress(): number {
        return Math.min(1, this._elapsed / this._duration);
    }

    get duration(): number {
        return this._duration;
    }

    get timesTriggered(): number {
        return this._timesTriggered;
    }

    // ===============================
    // Control
    // ===============================

    /**
     * Start or resume the timer.
     */
    start(): this {
        if (this._state === TimerState.Complete) {
            this.reset();
        }
        this._state = TimerState.Running;
        return this;
    }

    /**
     * Pause the timer.
     */
    pause(): this {
        if (this._state === TimerState.Running) {
            this._state = TimerState.Paused;
        }
        return this;
    }

    /**
     * Resume after pause.
     */
    resume(): this {
        if (this._state === TimerState.Paused) {
            this._state = TimerState.Running;
        }
        return this;
    }

    /**
     * Cancel the timer.
     */
    cancel(): this {
        this._state = TimerState.Idle;
        return this;
    }

    /**
     * Reset the timer.
     */
    reset(): this {
        this._elapsed = 0;
        this._timesTriggered = 0;
        this._state = TimerState.Idle;
        return this;
    }

    /**
     * Set a new duration.
     */
    setDuration(duration: number): this {
        this._duration = duration;
        return this;
    }

    /**
     * Set the callback.
     */
    setCallback(callback: TimerCallback): this {
        this._callback = callback;
        return this;
    }

    // ===============================
    // Update
    // ===============================

    /**
     * Update the timer.
     * Call this every frame with delta time.
     */
    update(dt: number): void {
        if (this._state !== TimerState.Running) {
            return;
        }

        this._elapsed += dt;

        if (this._elapsed >= this._duration) {
            this._trigger();
        }
    }

    /**
     * Trigger the callback.
     */
    private _trigger(): void {
        this._callback();
        this._timesTriggered++;

        if (this._repeat && this._timesTriggered < this._repeatCount) {
            // Reset for next iteration, preserving overflow
            this._elapsed = this._elapsed - this._duration;
        } else {
            this._state = TimerState.Complete;
        }
    }

    // ===============================
    // Static factory methods
    // ===============================

    /**
     * Create a one-shot delayed timer.
     */
    static delay(seconds: number, callback: TimerCallback): Timer {
        return new Timer(seconds, callback, { autoStart: true });
    }

    /**
     * Create a repeating timer.
     */
    static repeat(interval: number, callback: TimerCallback, count?: number): Timer {
        return new Timer(interval, callback, {
            repeat: true,
            repeatCount: count,
            autoStart: true,
        });
    }

    /**
     * Create a timer that runs every frame.
     * Useful for continuous effects.
     */
    static everyFrame(callback: TimerCallback): Timer {
        return new Timer(0, callback, { repeat: true, autoStart: true });
    }

    toString(): string {
        return `Timer(${this._duration}s, ${this._state}, ${this.progress.toFixed(2)}%)`;
    }
}

/**
 * TimerManager for managing multiple timers.
 */
export class TimerManager {
    private _timers: Set<Timer> = new Set();

    /**
     * Add a timer to be managed.
     */
    add(timer: Timer): Timer {
        this._timers.add(timer);
        return timer;
    }

    /**
     * Create and add a delayed timer.
     */
    delay(seconds: number, callback: TimerCallback): Timer {
        return this.add(Timer.delay(seconds, callback));
    }

    /**
     * Create and add a repeating timer.
     */
    repeat(interval: number, callback: TimerCallback, count?: number): Timer {
        return this.add(Timer.repeat(interval, callback, count));
    }

    /**
     * Remove a timer.
     */
    remove(timer: Timer): boolean {
        return this._timers.delete(timer);
    }

    /**
     * Update all timers.
     */
    update(dt: number): void {
        for (const timer of this._timers) {
            timer.update(dt);

            // Remove completed non-repeating timers
            if (timer.isComplete) {
                this._timers.delete(timer);
            }
        }
    }

    /**
     * Cancel all timers.
     */
    cancelAll(): void {
        for (const timer of this._timers) {
            timer.cancel();
        }
        this._timers.clear();
    }

    /**
     * Get the number of active timers.
     */
    get count(): number {
        return this._timers.size;
    }
}
