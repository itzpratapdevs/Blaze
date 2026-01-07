import type { SpriteFrame } from './SpriteSheet';

/**
 * Animation playback modes.
 */
export enum AnimationPlayMode {
    /** Play once and stop on last frame */
    Once = 'once',
    /** Loop continuously */
    Loop = 'loop',
    /** Play forward then backward, repeating */
    PingPong = 'pingpong',
    /** Play in reverse once */
    ReverseOnce = 'reverse_once',
    /** Loop in reverse */
    ReverseLoop = 'reverse_loop',
}

/**
 * Animation configuration.
 */
export interface AnimationConfig {
    /**
     * Frames to animate.
     */
    frames: SpriteFrame[];

    /**
     * Frames per second.
     */
    frameRate?: number;

    /**
     * Duration per frame in seconds (alternative to frameRate).
     */
    frameDuration?: number;

    /**
     * Playback mode.
     */
    mode?: AnimationPlayMode;

    /**
     * Called when animation completes (non-looping modes).
     */
    onComplete?: () => void;

    /**
     * Called when animation loops.
     */
    onLoop?: () => void;

    /**
     * Called when frame changes.
     */
    onFrameChange?: (frameIndex: number) => void;
}

/**
 * SpriteAnimation class for frame-based animations.
 *
 * Handles timing, looping, and frame transitions
 * independently of frame rate.
 *
 * @example
 * ```typescript
 * const walkAnim = new SpriteAnimation({
 *   frames: spriteSheet.getFrames(0, 7),
 *   frameRate: 12,
 *   mode: AnimationPlayMode.Loop,
 * });
 *
 * // In update loop
 * walkAnim.update(dt);
 * const currentFrame = walkAnim.currentFrame;
 * ```
 */
export class SpriteAnimation {
    private _frames: SpriteFrame[];
    private _frameDuration: number;
    private _mode: AnimationPlayMode;

    private _currentIndex: number = 0;
    private _elapsed: number = 0;
    private _isPlaying: boolean = false;
    private _isComplete: boolean = false;
    private _direction: 1 | -1 = 1;

    private _onComplete?: () => void;
    private _onLoop?: () => void;
    private _onFrameChange?: (index: number) => void;

    constructor(config: AnimationConfig) {
        this._frames = config.frames;

        // Calculate frame duration
        if (config.frameDuration !== undefined) {
            this._frameDuration = config.frameDuration;
        } else {
            const fps = config.frameRate ?? 12;
            this._frameDuration = 1 / fps;
        }

        this._mode = config.mode ?? AnimationPlayMode.Loop;
        this._onComplete = config.onComplete;
        this._onLoop = config.onLoop;
        this._onFrameChange = config.onFrameChange;

        // Set initial direction for reverse modes
        if (this._mode === AnimationPlayMode.ReverseOnce || this._mode === AnimationPlayMode.ReverseLoop) {
            this._direction = -1;
            this._currentIndex = this._frames.length - 1;
        }
    }

    // ===============================
    // State
    // ===============================

    get isPlaying(): boolean {
        return this._isPlaying;
    }

    get isComplete(): boolean {
        return this._isComplete;
    }

    get currentIndex(): number {
        return this._currentIndex;
    }

    get currentFrame(): SpriteFrame {
        return this._frames[this._currentIndex];
    }

    get frameCount(): number {
        return this._frames.length;
    }

    get progress(): number {
        return this._currentIndex / (this._frames.length - 1);
    }

    get duration(): number {
        return this._frames.length * this._frameDuration;
    }

    // ===============================
    // Playback control
    // ===============================

    /**
     * Start playing the animation.
     */
    play(): this {
        this._isPlaying = true;
        this._isComplete = false;
        return this;
    }

    /**
     * Pause the animation.
     */
    pause(): this {
        this._isPlaying = false;
        return this;
    }

    /**
     * Stop and reset the animation.
     */
    stop(): this {
        this._isPlaying = false;
        this.reset();
        return this;
    }

    /**
     * Reset animation to beginning.
     */
    reset(): this {
        this._elapsed = 0;
        this._isComplete = false;

        if (this._mode === AnimationPlayMode.ReverseOnce || this._mode === AnimationPlayMode.ReverseLoop) {
            this._currentIndex = this._frames.length - 1;
            this._direction = -1;
        } else {
            this._currentIndex = 0;
            this._direction = 1;
        }

        return this;
    }

    /**
     * Jump to a specific frame.
     */
    setFrame(index: number): this {
        if (index >= 0 && index < this._frames.length) {
            this._currentIndex = index;
            this._elapsed = 0;
            this._onFrameChange?.(index);
        }
        return this;
    }

    /**
     * Set frame rate (FPS).
     */
    setFrameRate(fps: number): this {
        this._frameDuration = 1 / fps;
        return this;
    }

    /**
     * Set playback mode.
     */
    setMode(mode: AnimationPlayMode): this {
        this._mode = mode;
        return this;
    }

    // ===============================
    // Update
    // ===============================

    /**
     * Update animation state.
     * Call this every frame with delta time.
     */
    update(dt: number): void {
        if (!this._isPlaying || this._isComplete || this._frames.length === 0) {
            return;
        }

        // Get frame-specific duration or default
        const currentFrameDuration =
            this._frames[this._currentIndex].duration ?? this._frameDuration;

        this._elapsed += dt;

        // Advance frames
        while (this._elapsed >= currentFrameDuration) {
            this._elapsed -= currentFrameDuration;
            this._advanceFrame();

            if (this._isComplete) break;
        }
    }

    /**
     * Advance to next frame based on mode.
     */
    private _advanceFrame(): void {
        const nextIndex = this._currentIndex + this._direction;

        switch (this._mode) {
            case AnimationPlayMode.Once:
                if (nextIndex >= this._frames.length) {
                    this._currentIndex = this._frames.length - 1;
                    this._isComplete = true;
                    this._isPlaying = false;
                    this._onComplete?.();
                } else {
                    this._currentIndex = nextIndex;
                    this._onFrameChange?.(this._currentIndex);
                }
                break;

            case AnimationPlayMode.Loop:
                this._currentIndex = nextIndex % this._frames.length;
                if (nextIndex >= this._frames.length) {
                    this._onLoop?.();
                }
                this._onFrameChange?.(this._currentIndex);
                break;

            case AnimationPlayMode.PingPong:
                if (nextIndex >= this._frames.length) {
                    this._direction = -1;
                    this._currentIndex = this._frames.length - 2;
                    this._onLoop?.();
                } else if (nextIndex < 0) {
                    this._direction = 1;
                    this._currentIndex = 1;
                    this._onLoop?.();
                } else {
                    this._currentIndex = nextIndex;
                }
                this._onFrameChange?.(this._currentIndex);
                break;

            case AnimationPlayMode.ReverseOnce:
                if (nextIndex < 0) {
                    this._currentIndex = 0;
                    this._isComplete = true;
                    this._isPlaying = false;
                    this._onComplete?.();
                } else {
                    this._currentIndex = nextIndex;
                    this._onFrameChange?.(this._currentIndex);
                }
                break;

            case AnimationPlayMode.ReverseLoop:
                if (nextIndex < 0) {
                    this._currentIndex = this._frames.length - 1;
                    this._onLoop?.();
                } else {
                    this._currentIndex = nextIndex;
                }
                this._onFrameChange?.(this._currentIndex);
                break;
        }
    }

    /**
     * Create a clone of this animation.
     */
    clone(): SpriteAnimation {
        const anim = new SpriteAnimation({
            frames: [...this._frames],
            frameDuration: this._frameDuration,
            mode: this._mode,
            onComplete: this._onComplete,
            onLoop: this._onLoop,
            onFrameChange: this._onFrameChange,
        });
        return anim;
    }

    toString(): string {
        return `SpriteAnimation(${this._frames.length} frames, ${this._mode})`;
    }
}
