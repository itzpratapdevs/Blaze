import { Component } from '../core/Component';
import { Vector2 } from '../math/Vector2';
import type { SkImage } from '@shopify/react-native-skia';

/**
 * Sprite anchor presets.
 */
export const SpriteAnchor = {
    TopLeft: new Vector2(0, 0),
    TopCenter: new Vector2(0.5, 0),
    TopRight: new Vector2(1, 0),
    CenterLeft: new Vector2(0, 0.5),
    Center: new Vector2(0.5, 0.5),
    CenterRight: new Vector2(1, 0.5),
    BottomLeft: new Vector2(0, 1),
    BottomCenter: new Vector2(0.5, 1),
    BottomRight: new Vector2(1, 1),
} as const;

/**
 * Sprite initialization options.
 */
export interface SpriteOptions {
    /**
     * Skia image to render.
     */
    image?: SkImage | null;

    /**
     * X position in world coordinates.
     */
    x?: number;

    /**
     * Y position in world coordinates.
     */
    y?: number;

    /**
     * Width in pixels (defaults to image width).
     */
    width?: number;

    /**
     * Height in pixels (defaults to image height).
     */
    height?: number;

    /**
     * Rotation in radians.
     */
    rotation?: number;

    /**
     * Scale multiplier.
     */
    scale?: number;

    /**
     * Scale X multiplier (overrides scale for X).
     */
    scaleX?: number;

    /**
     * Scale Y multiplier (overrides scale for Y).
     */
    scaleY?: number;

    /**
     * Anchor point (0-1, where 0,0 is top-left and 1,1 is bottom-right).
     */
    anchor?: Vector2;

    /**
     * Opacity (0-1).
     */
    opacity?: number;

    /**
     * Z-order for rendering (higher = on top).
     */
    zIndex?: number;

    /**
     * Tint color (hex string).
     */
    tint?: string;

    /**
     * Flip horizontally.
     */
    flipX?: boolean;

    /**
     * Flip vertically.
     */
    flipY?: boolean;

    /**
     * Whether visible.
     */
    visible?: boolean;
}

/**
 * Sprite component for rendering images.
 */
export class Sprite extends Component {
    // ===============================
    // Transform
    // ===============================

    /**
     * X position in world coordinates.
     */
    public x: number = 0;

    /**
     * Y position in world coordinates.
     */
    public y: number = 0;

    /**
     * Width in pixels.
     */
    public width: number = 0;

    /**
     * Height in pixels.
     */
    public height: number = 0;

    /**
     * Rotation in radians.
     */
    public rotation: number = 0;

    /**
     * Scale X multiplier.
     */
    public scaleX: number = 1;

    /**
     * Scale Y multiplier.
     */
    public scaleY: number = 1;

    /**
     * Anchor point (0-1).
     * Default is top-left (0, 0).
     */
    public anchor: Vector2 = new Vector2(0, 0);

    // ===============================
    // Rendering
    // ===============================

    /**
     * The Skia image to render.
     */
    private _image: SkImage | null = null;

    /**
     * Opacity (0-1).
     */
    public opacity: number = 1;

    /**
     * Whether the sprite is visible.
     */
    public visible: boolean = true;

    /**
     * Z-order for rendering.
     */
    public zIndex: number = 0;

    /**
     * Tint color (hex string).
     */
    public tint: string | null = null;

    /**
     * Flip horizontally.
     */
    public flipX: boolean = false;

    /**
     * Flip vertically.
     */
    public flipY: boolean = false;

    // ===============================
    // Constructor
    // ===============================

    constructor(options: SpriteOptions = {}) {
        super();

        if (options.image) {
            this.setImage(options.image);
        }

        this.x = options.x ?? 0;
        this.y = options.y ?? 0;
        this.rotation = options.rotation ?? 0;

        if (options.scale !== undefined) {
            this.scaleX = options.scale;
            this.scaleY = options.scale;
        }
        if (options.scaleX !== undefined) this.scaleX = options.scaleX;
        if (options.scaleY !== undefined) this.scaleY = options.scaleY;

        if (options.anchor) {
            this.anchor.copy(options.anchor);
        }

        this.opacity = options.opacity ?? 1;
        this.zIndex = options.zIndex ?? 0;
        this.tint = options.tint ?? null;
        this.flipX = options.flipX ?? false;
        this.flipY = options.flipY ?? false;

        // Set size from options or image
        if (options.width !== undefined) this.width = options.width;
        if (options.height !== undefined) this.height = options.height;
    }

    // ===============================
    // Image
    // ===============================

    /**
     * Get the current image.
     */
    get image(): SkImage | null {
        return this._image;
    }

    /**
     * Set the image.
     */
    setImage(image: SkImage | null): void {
        this._image = image;

        // Auto-set size from image if not already set
        if (image && this.width === 0 && this.height === 0) {
            this.width = image.width();
            this.height = image.height();
        }
    }

    // ===============================
    // Convenience methods
    // ===============================

    /**
     * Set position.
     */
    setPosition(x: number, y: number): this {
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * Set size.
     */
    setSize(width: number, height: number): this {
        this.width = width;
        this.height = height;
        return this;
    }

    /**
     * Set uniform scale.
     */
    setScale(scale: number): this {
        this.scaleX = scale;
        this.scaleY = scale;
        return this;
    }

    /**
     * Set anchor point.
     */
    setAnchor(x: number, y: number): this {
        this.anchor.set(x, y);
        return this;
    }

    /**
     * Center the anchor.
     */
    centerAnchor(): this {
        this.anchor.set(0.5, 0.5);
        return this;
    }

    /**
     * Set tint color.
     */
    setTint(color: string | null): this {
        this.tint = color;
        return this;
    }

    /**
     * Get the position as a Vector2.
     */
    getPosition(): Vector2 {
        return new Vector2(this.x, this.y);
    }

    /**
     * Get the center position (accounting for size and anchor).
     */
    getCenter(): Vector2 {
        const scaledWidth = this.width * this.scaleX;
        const scaledHeight = this.height * this.scaleY;

        return new Vector2(
            this.x + scaledWidth * (0.5 - this.anchor.x),
            this.y + scaledHeight * (0.5 - this.anchor.y)
        );
    }

    /**
     * Get the bounds (left, top, right, bottom).
     */
    getBounds(): { left: number; top: number; right: number; bottom: number } {
        const scaledWidth = this.width * this.scaleX;
        const scaledHeight = this.height * this.scaleY;
        const left = this.x - scaledWidth * this.anchor.x;
        const top = this.y - scaledHeight * this.anchor.y;

        return {
            left,
            top,
            right: left + scaledWidth,
            bottom: top + scaledHeight,
        };
    }

    /**
     * Check if a point is inside the sprite bounds.
     * Does not account for rotation.
     */
    containsPoint(px: number, py: number): boolean {
        const bounds = this.getBounds();
        return px >= bounds.left && px <= bounds.right && py >= bounds.top && py <= bounds.bottom;
    }

    /**
     * Move by an offset.
     */
    translate(dx: number, dy: number): this {
        this.x += dx;
        this.y += dy;
        return this;
    }

    /**
     * Rotate by an angle.
     */
    rotate(angle: number): this {
        this.rotation += angle;
        return this;
    }

    toString(): string {
        return `Sprite(${this.x.toFixed(1)}, ${this.y.toFixed(1)}, ${this.width}x${this.height})`;
    }
}
