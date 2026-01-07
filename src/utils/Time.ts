/**
 * Time utilities for game loop timing.
 * Updated by the game loop each frame - do not modify these values directly.
 */
export class Time {
    /** Time since last frame in seconds */
    private static _delta: number = 0;

    /** Total elapsed time since game start in seconds */
    private static _elapsed: number = 0;

    /** Total number of frames rendered */
    private static _frameCount: number = 0;

    /** Current frames per second */
    private static _fps: number = 0;

    /** Target FPS for the game loop */
    private static _targetFPS: number = 60;

    /** Fixed delta time for physics (1/60 by default) */
    private static _fixedDelta: number = 1 / 60;

    /** Time scale multiplier (1 = normal, 0.5 = half speed, 2 = double speed) */
    private static _timeScale: number = 1;

    // FPS calculation
    private static _fpsAccumulator: number = 0;
    private static _fpsFrameCount: number = 0;
    private static _lastFpsUpdate: number = 0;

    // ===============================
    // Public getters
    // ===============================

    /**
     * Time since last frame in seconds.
     * Use this for smooth movement: position += velocity * Time.delta
     */
    static get delta(): number {
        return this._delta * this._timeScale;
    }

    /**
     * Raw delta time without time scale applied.
     */
    static get unscaledDelta(): number {
        return this._delta;
    }

    /**
     * Total elapsed time since game start in seconds.
     */
    static get elapsed(): number {
        return this._elapsed;
    }

    /**
     * Total number of frames rendered.
     */
    static get frameCount(): number {
        return this._frameCount;
    }

    /**
     * Current frames per second (updated once per second).
     */
    static get fps(): number {
        return this._fps;
    }

    /**
     * Target frames per second.
     */
    static get targetFPS(): number {
        return this._targetFPS;
    }

    /**
     * Fixed delta time for physics calculations.
     */
    static get fixedDelta(): number {
        return this._fixedDelta * this._timeScale;
    }

    /**
     * Time scale multiplier.
     */
    static get timeScale(): number {
        return this._timeScale;
    }

    // ===============================
    // Public setters/methods
    // ===============================

    /**
     * Set the time scale multiplier.
     * @param scale 1 = normal, 0.5 = half speed, 2 = double speed, 0 = paused
     */
    static setTimeScale(scale: number): void {
        this._timeScale = Math.max(0, scale);
    }

    /**
     * Set the target FPS.
     * Also updates fixedDelta to match.
     */
    static setTargetFPS(fps: number): void {
        this._targetFPS = Math.max(1, fps);
        this._fixedDelta = 1 / this._targetFPS;
    }

    /**
     * Reset all time values.
     */
    static reset(): void {
        this._delta = 0;
        this._elapsed = 0;
        this._frameCount = 0;
        this._fps = 0;
        this._timeScale = 1;
        this._fpsAccumulator = 0;
        this._fpsFrameCount = 0;
        this._lastFpsUpdate = 0;
    }

    // ===============================
    // Internal methods (called by GameLoop)
    // ===============================

    /**
     * @internal Called by GameLoop each frame.
     */
    static _update(deltaSeconds: number): void {
        // Clamp delta to prevent spiral of death
        this._delta = Math.min(deltaSeconds, 0.1);
        this._elapsed += this._delta;
        this._frameCount++;

        // FPS calculation (update once per second)
        this._fpsAccumulator += deltaSeconds;
        this._fpsFrameCount++;
        if (this._fpsAccumulator >= 1.0) {
            this._fps = Math.round(this._fpsFrameCount / this._fpsAccumulator);
            this._fpsAccumulator = 0;
            this._fpsFrameCount = 0;
        }
    }

    /**
     * @internal Get the fixed delta for physics stepping.
     */
    static _getFixedDelta(): number {
        return this._fixedDelta;
    }
}
