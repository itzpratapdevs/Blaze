import { Vector2 } from '../math/Vector2';
import type { Entity } from '../core/Entity';

/**
 * Camera for world-to-screen transformations.
 * Supports following entities and zoom.
 */
export class Camera {
    /**
     * Camera position (center of view).
     */
    public position: Vector2;

    /**
     * Zoom level (1 = normal, 2 = 2x zoom in, 0.5 = zoom out).
     */
    public zoom: number = 1;

    /**
     * Rotation in radians.
     */
    public rotation: number = 0;

    /**
     * Viewport width.
     */
    private _viewportWidth: number;

    /**
     * Viewport height.
     */
    private _viewportHeight: number;

    /**
     * Entity to follow.
     */
    private _followTarget: Entity | null = null;

    /**
     * Offset from follow target.
     */
    private _followOffset: Vector2 = new Vector2();

    /**
     * Smoothing factor for camera following (0-1, 1 = instant).
     */
    private _followLerp: number = 0.1;

    /**
     * Position accessor for follow target (function to get target position).
     */
    private _followPositionAccessor: ((entity: Entity) => Vector2) | null = null;

    /**
     * Camera bounds (optional).
     */
    private _bounds: { minX: number; minY: number; maxX: number; maxY: number } | null = null;

    /**
     * Shake parameters.
     */
    private _shakeIntensity: number = 0;
    private _shakeDuration: number = 0;
    private _shakeElapsed: number = 0;
    private _shakeOffset: Vector2 = new Vector2();

    constructor(viewportWidth: number, viewportHeight: number) {
        this._viewportWidth = viewportWidth;
        this._viewportHeight = viewportHeight;
        this.position = new Vector2(viewportWidth / 2, viewportHeight / 2);
    }

    // ===============================
    // Getters
    // ===============================

    get viewportWidth(): number {
        return this._viewportWidth;
    }

    get viewportHeight(): number {
        return this._viewportHeight;
    }

    /**
     * Get the visible world bounds.
     */
    get visibleBounds(): { left: number; right: number; top: number; bottom: number } {
        const halfWidth = this._viewportWidth / (2 * this.zoom);
        const halfHeight = this._viewportHeight / (2 * this.zoom);

        return {
            left: this.position.x - halfWidth,
            right: this.position.x + halfWidth,
            top: this.position.y - halfHeight,
            bottom: this.position.y + halfHeight,
        };
    }

    // ===============================
    // Configuration
    // ===============================

    /**
     * Set the viewport size.
     */
    setViewport(width: number, height: number): void {
        this._viewportWidth = width;
        this._viewportHeight = height;
    }

    /**
     * Set the zoom level.
     */
    setZoom(zoom: number): void {
        this.zoom = Math.max(0.1, Math.min(10, zoom));
    }

    /**
     * Set camera bounds (world coordinates).
     */
    setBounds(minX: number, minY: number, maxX: number, maxY: number): void {
        this._bounds = { minX, minY, maxX, maxY };
    }

    /**
     * Clear camera bounds.
     */
    clearBounds(): void {
        this._bounds = null;
    }

    // ===============================
    // Following
    // ===============================

    /**
     * Start following an entity.
     * @param target Entity to follow
     * @param lerp Smoothing factor (0-1)
     * @param offset Offset from target center
     * @param positionAccessor Optional function to get position from entity
     */
    follow(
        target: Entity,
        lerp: number = 0.1,
        offset?: Vector2,
        positionAccessor?: (entity: Entity) => Vector2
    ): void {
        this._followTarget = target;
        this._followLerp = Math.max(0, Math.min(1, lerp));

        if (offset) {
            this._followOffset.copy(offset);
        } else {
            this._followOffset.set(0, 0);
        }

        this._followPositionAccessor = positionAccessor ?? null;
    }

    /**
     * Stop following.
     */
    stopFollow(): void {
        this._followTarget = null;
    }

    /**
     * Get the follow target.
     */
    get followTarget(): Entity | null {
        return this._followTarget;
    }

    // ===============================
    // Shake effect
    // ===============================

    /**
     * Shake the camera.
     * @param intensity Maximum shake offset in pixels
     * @param duration Duration in seconds
     */
    shake(intensity: number, duration: number): void {
        this._shakeIntensity = intensity;
        this._shakeDuration = duration;
        this._shakeElapsed = 0;
    }

    /**
     * Stop camera shake immediately.
     */
    stopShake(): void {
        this._shakeDuration = 0;
        this._shakeOffset.set(0, 0);
    }

    // ===============================
    // Transformations
    // ===============================

    /**
     * Convert world coordinates to screen coordinates.
     */
    worldToScreen(point: Vector2): Vector2 {
        const screenX =
            (point.x - this.position.x - this._shakeOffset.x) * this.zoom +
            this._viewportWidth / 2;
        const screenY =
            (point.y - this.position.y - this._shakeOffset.y) * this.zoom +
            this._viewportHeight / 2;

        return new Vector2(screenX, screenY);
    }

    /**
     * Convert world coordinates to screen coordinates (into existing vector).
     * No allocation.
     */
    worldToScreenInto(point: Vector2, out: Vector2): Vector2 {
        out.x =
            (point.x - this.position.x - this._shakeOffset.x) * this.zoom +
            this._viewportWidth / 2;
        out.y =
            (point.y - this.position.y - this._shakeOffset.y) * this.zoom +
            this._viewportHeight / 2;

        return out;
    }

    /**
     * Convert screen coordinates to world coordinates.
     */
    screenToWorld(point: Vector2): Vector2 {
        const worldX =
            (point.x - this._viewportWidth / 2) / this.zoom +
            this.position.x +
            this._shakeOffset.x;
        const worldY =
            (point.y - this._viewportHeight / 2) / this.zoom +
            this.position.y +
            this._shakeOffset.y;

        return new Vector2(worldX, worldY);
    }

    /**
     * Convert screen coordinates to world coordinates (into existing vector).
     * No allocation.
     */
    screenToWorldInto(point: Vector2, out: Vector2): Vector2 {
        out.x =
            (point.x - this._viewportWidth / 2) / this.zoom +
            this.position.x +
            this._shakeOffset.x;
        out.y =
            (point.y - this._viewportHeight / 2) / this.zoom +
            this.position.y +
            this._shakeOffset.y;

        return out;
    }

    /**
     * Check if a world point is visible on screen.
     */
    isVisible(x: number, y: number, margin: number = 0): boolean {
        const bounds = this.visibleBounds;
        return (
            x >= bounds.left - margin &&
            x <= bounds.right + margin &&
            y >= bounds.top - margin &&
            y <= bounds.bottom + margin
        );
    }

    /**
     * Check if a world rectangle is visible on screen.
     */
    isRectVisible(
        x: number,
        y: number,
        width: number,
        height: number,
        margin: number = 0
    ): boolean {
        const bounds = this.visibleBounds;
        return (
            x + width >= bounds.left - margin &&
            x <= bounds.right + margin &&
            y + height >= bounds.top - margin &&
            y <= bounds.bottom + margin
        );
    }

    // ===============================
    // Update
    // ===============================

    /**
     * Update camera (call each frame).
     */
    update(dt: number): void {
        // Update following
        if (this._followTarget && this._followTarget.active) {
            let targetPos: Vector2;

            if (this._followPositionAccessor) {
                targetPos = this._followPositionAccessor(this._followTarget);
            } else {
                // Default: assume entity has a position (Sprite or Transform component)
                // For now, just keep current position if no accessor provided
                targetPos = this.position;
            }

            // Apply offset
            const targetX = targetPos.x + this._followOffset.x;
            const targetY = targetPos.y + this._followOffset.y;

            // Lerp towards target
            this.position.x += (targetX - this.position.x) * this._followLerp;
            this.position.y += (targetY - this.position.y) * this._followLerp;
        }

        // Apply bounds
        if (this._bounds) {
            const halfWidth = this._viewportWidth / (2 * this.zoom);
            const halfHeight = this._viewportHeight / (2 * this.zoom);

            this.position.x = Math.max(
                this._bounds.minX + halfWidth,
                Math.min(this._bounds.maxX - halfWidth, this.position.x)
            );
            this.position.y = Math.max(
                this._bounds.minY + halfHeight,
                Math.min(this._bounds.maxY - halfHeight, this.position.y)
            );
        }

        // Update shake
        if (this._shakeDuration > 0) {
            this._shakeElapsed += dt;

            if (this._shakeElapsed >= this._shakeDuration) {
                this.stopShake();
            } else {
                // Decay intensity over time
                const t = 1 - this._shakeElapsed / this._shakeDuration;
                const intensity = this._shakeIntensity * t;

                this._shakeOffset.x = (Math.random() * 2 - 1) * intensity;
                this._shakeOffset.y = (Math.random() * 2 - 1) * intensity;
            }
        }
    }

    /**
     * Reset camera to default state.
     */
    reset(): void {
        this.position.set(this._viewportWidth / 2, this._viewportHeight / 2);
        this.zoom = 1;
        this.rotation = 0;
        this._followTarget = null;
        this._bounds = null;
        this.stopShake();
    }
}
