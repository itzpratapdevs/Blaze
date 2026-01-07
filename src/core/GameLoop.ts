import { Time } from '../utils/Time';
import { Logger } from '../utils/Logger';

/**
 * Callback function for frame updates.
 */
export type FrameCallback = (dt: number) => void;

/**
 * Game loop states.
 */
export enum GameLoopState {
    Stopped = 'stopped',
    Running = 'running',
    Paused = 'paused',
}

/**
 * Game loop using requestAnimationFrame.
 *
 * For production, native modules (Choreographer on Android, CADisplayLink on iOS)
 * can be used for more precise timing. This JS implementation works for development.
 */
export class GameLoop {
    private _state: GameLoopState = GameLoopState.Stopped;
    private _targetFPS: number = 60;
    private _frameTime: number = 1000 / 60;

    private _lastTime: number = 0;
    private _accumulator: number = 0;
    private _rafId: number | null = null;

    private _onFrame: FrameCallback | null = null;
    private _onFixedUpdate: FrameCallback | null = null;

    /**
     * Fixed timestep for physics (in seconds).
     */
    private _fixedTimestep: number = 1 / 60;

    /**
     * Maximum accumulated time to prevent spiral of death.
     */
    private _maxAccumulator: number = 0.2;

    constructor() {
        // Bind the loop function to preserve 'this' context
        this._loop = this._loop.bind(this);
    }

    // ===============================
    // State
    // ===============================

    get state(): GameLoopState {
        return this._state;
    }

    get isRunning(): boolean {
        return this._state === GameLoopState.Running;
    }

    get isPaused(): boolean {
        return this._state === GameLoopState.Paused;
    }

    get targetFPS(): number {
        return this._targetFPS;
    }

    // ===============================
    // Configuration
    // ===============================

    /**
     * Set the target FPS.
     */
    setFPS(fps: number): void {
        this._targetFPS = Math.max(1, Math.min(120, fps));
        this._frameTime = 1000 / this._targetFPS;
        this._fixedTimestep = 1 / this._targetFPS;
        Time.setTargetFPS(this._targetFPS);
        Logger.debug(`GameLoop: target FPS set to ${this._targetFPS}`);
    }

    /**
     * Set the fixed timestep for physics.
     */
    setFixedTimestep(dt: number): void {
        this._fixedTimestep = Math.max(0.001, dt);
    }

    /**
     * Set the frame callback.
     */
    onFrame(callback: FrameCallback): void {
        this._onFrame = callback;
    }

    /**
     * Set the fixed update callback (for physics).
     */
    onFixedUpdate(callback: FrameCallback): void {
        this._onFixedUpdate = callback;
    }

    // ===============================
    // Control
    // ===============================

    /**
     * Start the game loop.
     */
    start(): void {
        if (this._state === GameLoopState.Running) {
            Logger.warn('GameLoop: already running');
            return;
        }

        Logger.info('GameLoop: starting');
        this._state = GameLoopState.Running;
        this._lastTime = performance.now();
        this._accumulator = 0;
        Time.reset();

        this._scheduleFrame();
    }

    /**
     * Stop the game loop.
     */
    stop(): void {
        if (this._state === GameLoopState.Stopped) {
            return;
        }

        Logger.info('GameLoop: stopping');
        this._cancelFrame();
        this._state = GameLoopState.Stopped;
    }

    /**
     * Pause the game loop.
     * The loop keeps running but callbacks are not invoked.
     */
    pause(): void {
        if (this._state === GameLoopState.Running) {
            Logger.info('GameLoop: pausing');
            this._state = GameLoopState.Paused;
        }
    }

    /**
     * Resume the game loop.
     */
    resume(): void {
        if (this._state === GameLoopState.Paused) {
            Logger.info('GameLoop: resuming');
            this._lastTime = performance.now();
            this._state = GameLoopState.Running;
        }
    }

    // ===============================
    // Internal
    // ===============================

    private _scheduleFrame(): void {
        this._rafId = requestAnimationFrame(this._loop);
    }

    private _cancelFrame(): void {
        if (this._rafId !== null) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
    }

    private _loop(currentTime: number): void {
        if (this._state === GameLoopState.Stopped) {
            return;
        }

        // Schedule next frame first
        this._scheduleFrame();

        // Calculate delta time
        const rawDt = (currentTime - this._lastTime) / 1000;
        this._lastTime = currentTime;

        // Skip if paused
        if (this._state === GameLoopState.Paused) {
            return;
        }

        // Clamp delta time to prevent huge jumps (e.g., after tab switch)
        const dt = Math.min(rawDt, this._maxAccumulator);

        // Update Time system
        Time._update(dt);

        // Fixed timestep updates (for physics)
        if (this._onFixedUpdate) {
            this._accumulator += dt;

            // Clamp accumulator to prevent spiral of death
            if (this._accumulator > this._maxAccumulator) {
                this._accumulator = this._maxAccumulator;
            }

            while (this._accumulator >= this._fixedTimestep) {
                this._onFixedUpdate(this._fixedTimestep);
                this._accumulator -= this._fixedTimestep;
            }
        }

        // Variable timestep update (for rendering and logic)
        if (this._onFrame) {
            this._onFrame(dt);
        }
    }
}

/**
 * Create a global game loop instance.
 * Most games only need one loop.
 */
export const globalGameLoop = new GameLoop();
