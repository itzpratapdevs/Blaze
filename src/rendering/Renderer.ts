import { Sprite } from './Sprite';
import { Camera } from './Camera';
import { Rect } from '../math/Rect';
import { Vector2 } from '../math/Vector2';
import { Skia, type SkCanvas, type SkPaint, type SkImage } from '@shopify/react-native-skia';

/**
 * Text rendering options.
 */
export interface TextOptions {
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    align?: 'left' | 'center' | 'right';
    baseline?: 'top' | 'middle' | 'bottom';
}

/**
 * Circle rendering options.
 */
export interface CircleOptions {
    fill?: boolean;
    strokeWidth?: number;
    color?: string;
    opacity?: number;
}

/**
 * Line rendering options.
 */
export interface LineOptions {
    color?: string;
    strokeWidth?: number;
    opacity?: number;
}

/**
 * Renderer using react-native-skia.
 * All drawing operations go through this class.
 */
export class Renderer {
    private _canvas: SkCanvas;
    private _camera: Camera;
    private _width: number;
    private _height: number;

    // Reusable paint objects to minimize allocations
    private _paint: SkPaint;
    private _textPaint: SkPaint;

    // Screen coordinate cache
    private _screenPos: Vector2 = new Vector2();

    constructor(canvas: SkCanvas, camera: Camera, width: number, height: number) {
        this._canvas = canvas;
        this._camera = camera;
        this._width = width;
        this._height = height;

        // Create reusable paint objects
        this._paint = Skia.Paint();
        this._textPaint = Skia.Paint();
        this._textPaint.setAntiAlias(true);
    }

    // ===============================
    // Getters
    // ===============================

    get canvas(): SkCanvas {
        return this._canvas;
    }

    get camera(): Camera {
        return this._camera;
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }

    // ===============================
    // Frame lifecycle
    // ===============================

    /**
     * Begin a new frame.
     * Call this before any drawing.
     */
    beginFrame(): void {
        this._canvas.save();
    }

    /**
     * End the current frame.
     * Call this after all drawing.
     */
    endFrame(): void {
        this._canvas.restore();
    }

    // ===============================
    // Basic drawing
    // ===============================

    /**
     * Clear the canvas with a color.
     */
    clear(color: string): void {
        const skColor = Skia.Color(color);
        this._canvas.drawColor(skColor);
    }

    /**
     * Draw a sprite.
     * Uses camera transform automatically.
     */
    draw(sprite: Sprite): void {
        if (!sprite.visible || !sprite.image || sprite.opacity <= 0) {
            return;
        }

        // Frustum culling - skip if sprite is not visible
        if (
            !this._camera.isRectVisible(
                sprite.x - sprite.width * sprite.anchor.x * sprite.scaleX,
                sprite.y - sprite.height * sprite.anchor.y * sprite.scaleY,
                sprite.width * sprite.scaleX,
                sprite.height * sprite.scaleY
            )
        ) {
            return;
        }

        this._canvas.save();

        // Apply camera transform
        this._applyCamera();

        // Calculate anchor offset
        const anchorX = sprite.width * sprite.anchor.x;
        const anchorY = sprite.height * sprite.anchor.y;

        // Translate to sprite position
        this._canvas.translate(sprite.x, sprite.y);

        // Apply rotation around anchor
        if (sprite.rotation !== 0) {
            this._canvas.rotate((sprite.rotation * 180) / Math.PI);
        }

        // Apply scale (with flip support)
        const scaleX = sprite.scaleX * (sprite.flipX ? -1 : 1);
        const scaleY = sprite.scaleY * (sprite.flipY ? -1 : 1);
        this._canvas.scale(scaleX, scaleY);

        // Setup paint
        this._paint.reset();
        if (sprite.opacity < 1) {
            this._paint.setAlphaf(sprite.opacity);
        }

        // Draw the image
        this._canvas.drawImage(
            sprite.image,
            -anchorX,
            -anchorY,
            this._paint
        );

        this._canvas.restore();
    }

    /**
     * Draw a raw Skia image at a position.
     * Uses camera transform.
     */
    drawImage(
        image: SkImage,
        x: number,
        y: number,
        width?: number,
        height?: number,
        opacity: number = 1
    ): void {
        this._canvas.save();
        this._applyCamera();

        this._paint.reset();
        if (opacity < 1) {
            this._paint.setAlphaf(opacity);
        }

        if (width !== undefined && height !== undefined) {
            const srcRect = Skia.XYWHRect(0, 0, image.width(), image.height());
            const dstRect = Skia.XYWHRect(x, y, width, height);
            this._canvas.drawImageRect(image, srcRect, dstRect, this._paint);
        } else {
            this._canvas.drawImage(image, x, y, this._paint);
        }

        this._canvas.restore();
    }

    /**
     * Draw a filled or stroked rectangle.
     * Uses camera transform.
     */
    drawRect(rect: Rect, color: string, fill: boolean = true, strokeWidth: number = 1): void {
        this._canvas.save();
        this._applyCamera();

        this._paint.reset();
        this._paint.setColor(Skia.Color(color));

        if (fill) {
            this._paint.setStyle(0); // Fill
        } else {
            this._paint.setStyle(1); // Stroke
            this._paint.setStrokeWidth(strokeWidth);
        }

        const skRect = Skia.XYWHRect(rect.x, rect.y, rect.width, rect.height);
        this._canvas.drawRect(skRect, this._paint);

        this._canvas.restore();
    }

    /**
     * Draw a rectangle at specific coordinates.
     */
    drawRectXYWH(
        x: number,
        y: number,
        width: number,
        height: number,
        color: string,
        fill: boolean = true,
        strokeWidth: number = 1
    ): void {
        this._canvas.save();
        this._applyCamera();

        this._paint.reset();
        this._paint.setColor(Skia.Color(color));

        if (fill) {
            this._paint.setStyle(0);
        } else {
            this._paint.setStyle(1);
            this._paint.setStrokeWidth(strokeWidth);
        }

        const skRect = Skia.XYWHRect(x, y, width, height);
        this._canvas.drawRect(skRect, this._paint);

        this._canvas.restore();
    }

    /**
     * Draw a circle.
     * Uses camera transform.
     */
    drawCircle(
        x: number,
        y: number,
        radius: number,
        options: CircleOptions = {}
    ): void {
        this._canvas.save();
        this._applyCamera();

        this._paint.reset();
        this._paint.setColor(Skia.Color(options.color ?? '#ffffff'));

        if (options.fill !== false) {
            this._paint.setStyle(0);
        } else {
            this._paint.setStyle(1);
            this._paint.setStrokeWidth(options.strokeWidth ?? 1);
        }

        if (options.opacity !== undefined && options.opacity < 1) {
            this._paint.setAlphaf(options.opacity);
        }

        this._canvas.drawCircle(x, y, radius, this._paint);

        this._canvas.restore();
    }

    /**
     * Draw a line.
     * Uses camera transform.
     */
    drawLine(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        options: LineOptions = {}
    ): void {
        this._canvas.save();
        this._applyCamera();

        this._paint.reset();
        this._paint.setColor(Skia.Color(options.color ?? '#ffffff'));
        this._paint.setStyle(1); // Stroke
        this._paint.setStrokeWidth(options.strokeWidth ?? 1);

        if (options.opacity !== undefined && options.opacity < 1) {
            this._paint.setAlphaf(options.opacity);
        }

        this._canvas.drawLine(x1, y1, x2, y2, this._paint);

        this._canvas.restore();
    }

    // ===============================
    // Text drawing
    // ===============================

    /**
     * Draw text.
     * Does NOT use camera transform (screen space).
     */
    drawText(
        text: string,
        x: number,
        y: number,
        options: TextOptions = {}
    ): void {
        const fontSize = options.fontSize ?? 16;
        const fontFamily = options.fontFamily ?? 'system-ui';

        this._textPaint.reset();
        this._textPaint.setColor(Skia.Color(options.color ?? '#ffffff'));
        this._textPaint.setAntiAlias(true);

        const font = Skia.Font(null, fontSize);

        // Handle alignment
        let drawX = x;
        if (options.align === 'center' || options.align === 'right') {
            const width = font.measureText(text).width;
            if (options.align === 'center') {
                drawX = x - width / 2;
            } else {
                drawX = x - width;
            }
        }

        this._canvas.drawText(text, drawX, y, this._textPaint, font);
    }

    /**
     * Draw text in world coordinates.
     * Uses camera transform.
     */
    drawWorldText(
        text: string,
        x: number,
        y: number,
        options: TextOptions = {}
    ): void {
        this._canvas.save();
        this._applyCamera();

        const fontSize = (options.fontSize ?? 16) / this._camera.zoom;
        const fontFamily = options.fontFamily ?? 'system-ui';

        this._textPaint.reset();
        this._textPaint.setColor(Skia.Color(options.color ?? '#ffffff'));
        this._textPaint.setAntiAlias(true);

        const font = Skia.Font(null, fontSize);
        this._canvas.drawText(text, x, y, this._textPaint, font);

        this._canvas.restore();
    }

    // ===============================
    // Screen-space drawing (no camera)
    // ===============================

    /**
     * Draw a screen-space rectangle (for UI).
     */
    drawScreenRect(
        x: number,
        y: number,
        width: number,
        height: number,
        color: string,
        fill: boolean = true,
        strokeWidth: number = 1
    ): void {
        this._paint.reset();
        this._paint.setColor(Skia.Color(color));

        if (fill) {
            this._paint.setStyle(0);
        } else {
            this._paint.setStyle(1);
            this._paint.setStrokeWidth(strokeWidth);
        }

        const skRect = Skia.XYWHRect(x, y, width, height);
        this._canvas.drawRect(skRect, this._paint);
    }

    /**
     * Draw a screen-space circle (for UI).
     */
    drawScreenCircle(
        x: number,
        y: number,
        radius: number,
        color: string,
        fill: boolean = true,
        strokeWidth: number = 1
    ): void {
        this._paint.reset();
        this._paint.setColor(Skia.Color(color));

        if (fill) {
            this._paint.setStyle(0);
        } else {
            this._paint.setStyle(1);
            this._paint.setStrokeWidth(strokeWidth);
        }

        this._canvas.drawCircle(x, y, radius, this._paint);
    }

    // ===============================
    // Internal helpers
    // ===============================

    /**
     * Apply camera transformation to the canvas.
     */
    private _applyCamera(): void {
        // Translate to center screen
        this._canvas.translate(this._width / 2, this._height / 2);

        // Apply zoom
        this._canvas.scale(this._camera.zoom, this._camera.zoom);

        // Translate by camera position
        this._canvas.translate(-this._camera.position.x, -this._camera.position.y);
    }
}
