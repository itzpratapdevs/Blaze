import { Sprite, type SpriteOptions } from '../rendering/Sprite';
import { SpriteAnimation, AnimationPlayMode } from './SpriteAnimation';
import type { SpriteFrame } from './SpriteSheet';

/**
 * AnimatedSprite combines a Sprite with multiple animations.
 *
 * @example
 * ```typescript
 * const player = new AnimatedSprite({
 *   x: 100,
 *   y: 200,
 *   width: 32,
 *   height: 32,
 * });
 *
 * player.addAnimation('idle', idleAnim);
 * player.addAnimation('walk', walkAnim);
 * player.addAnimation('jump', jumpAnim);
 *
 * player.play('walk');
 *
 * // In update loop
 * player.update(dt);
 * ```
 */
export class AnimatedSprite extends Sprite {
    /**
     * Registered animations.
     */
    private _animations: Map<string, SpriteAnimation> = new Map();

    /**
     * Currently playing animation name.
     */
    private _currentName: string | null = null;

    /**
     * Currently playing animation.
     */
    private _currentAnimation: SpriteAnimation | null = null;

    /**
     * Whether to auto-update the sprite image from animation.
     */
    public autoUpdateImage: boolean = true;

    constructor(options: SpriteOptions = {}) {
        super(options);
    }

    // ===============================
    // Animation management
    // ===============================

    /**
     * Add an animation.
     */
    addAnimation(name: string, animation: SpriteAnimation): this {
        this._animations.set(name, animation);
        return this;
    }

    /**
     * Add animation from frames directly.
     */
    addAnimationFromFrames(
        name: string,
        frames: SpriteFrame[],
        frameRate: number = 12,
        mode: AnimationPlayMode = AnimationPlayMode.Loop
    ): this {
        const animation = new SpriteAnimation({
            frames,
            frameRate,
            mode,
        });
        return this.addAnimation(name, animation);
    }

    /**
     * Remove an animation.
     */
    removeAnimation(name: string): boolean {
        if (this._currentName === name) {
            this.stop();
        }
        return this._animations.delete(name);
    }

    /**
     * Get an animation by name.
     */
    getAnimation(name: string): SpriteAnimation | undefined {
        return this._animations.get(name);
    }

    /**
     * Check if animation exists.
     */
    hasAnimation(name: string): boolean {
        return this._animations.has(name);
    }

    /**
     * Get all animation names.
     */
    getAnimationNames(): string[] {
        return Array.from(this._animations.keys());
    }

    // ===============================
    // Playback
    // ===============================

    /**
     * Get current animation name.
     */
    get current(): string | null {
        return this._currentName;
    }

    /**
     * Get current animation.
     */
    get currentAnimation(): SpriteAnimation | null {
        return this._currentAnimation;
    }

    /**
     * Check if currently playing.
     */
    get isPlaying(): boolean {
        return this._currentAnimation?.isPlaying ?? false;
    }

    /**
     * Play an animation by name.
     * @param name Animation name
     * @param restart If true, restart even if already playing this animation
     */
    play(name: string, restart: boolean = false): this {
        if (!restart && this._currentName === name && this._currentAnimation?.isPlaying) {
            return this;
        }

        const animation = this._animations.get(name);
        if (!animation) {
            console.warn(`AnimatedSprite: Animation '${name}' not found`);
            return this;
        }

        // Stop current animation
        if (this._currentAnimation) {
            this._currentAnimation.stop();
        }

        this._currentName = name;
        this._currentAnimation = animation;
        this._currentAnimation.reset().play();

        // Update sprite image immediately
        if (this.autoUpdateImage) {
            this._updateFrame();
        }

        return this;
    }

    /**
     * Pause current animation.
     */
    pause(): this {
        this._currentAnimation?.pause();
        return this;
    }

    /**
     * Resume current animation.
     */
    resume(): this {
        this._currentAnimation?.play();
        return this;
    }

    /**
     * Stop current animation.
     */
    stop(): this {
        this._currentAnimation?.stop();
        return this;
    }

    /**
     * Reset current animation.
     */
    reset(): this {
        this._currentAnimation?.reset();
        if (this.autoUpdateImage) {
            this._updateFrame();
        }
        return this;
    }

    // ===============================
    // Update
    // ===============================

    /**
     * Update the animation.
     * Call this every frame with delta time.
     */
    update(dt: number): void {
        if (!this._currentAnimation || !this._currentAnimation.isPlaying) {
            return;
        }

        const prevIndex = this._currentAnimation.currentIndex;
        this._currentAnimation.update(dt);

        // Update sprite image if frame changed
        if (this.autoUpdateImage && this._currentAnimation.currentIndex !== prevIndex) {
            this._updateFrame();
        }
    }

    /**
     * Update the sprite image from current animation frame.
     */
    private _updateFrame(): void {
        if (!this._currentAnimation) return;

        const frame = this._currentAnimation.currentFrame;
        if (frame) {
            // Note: For sprite sheet rendering, we need to track the source rect
            // The Renderer will need to be updated to handle this
            this.setImage(frame.image);
            (this as any)._sourceRect = frame.sourceRect;
        }
    }

    /**
     * Get the current source rectangle for sprite sheet rendering.
     */
    get sourceRect() {
        return (this as any)._sourceRect ?? null;
    }

    /**
     * Set frame rate for current animation.
     */
    setFrameRate(fps: number): this {
        this._currentAnimation?.setFrameRate(fps);
        return this;
    }

    /**
     * Set play mode for current animation.
     */
    setPlayMode(mode: AnimationPlayMode): this {
        this._currentAnimation?.setMode(mode);
        return this;
    }

    toString(): string {
        return `AnimatedSprite(${this.x.toFixed(1)}, ${this.y.toFixed(1)}, playing: ${this._currentName ?? 'none'})`;
    }
}
