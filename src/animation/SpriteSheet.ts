import type { SkImage } from '@shopify/react-native-skia';
import { Rect } from '../math/Rect';

/**
 * Represents a single frame from a sprite sheet.
 */
export interface SpriteFrame {
    /**
     * Source image.
     */
    image: SkImage;

    /**
     * Source rectangle within the image.
     */
    sourceRect: Rect;

    /**
     * Frame duration override (optional).
     */
    duration?: number;
}

/**
 * Configuration for creating a SpriteSheet.
 */
export interface SpriteSheetConfig {
    /**
     * The source image containing all frames.
     */
    image: SkImage;

    /**
     * Width of each frame in pixels.
     */
    frameWidth: number;

    /**
     * Height of each frame in pixels.
     */
    frameHeight: number;

    /**
     * Total number of frames (auto-calculated if not provided).
     */
    frameCount?: number;

    /**
     * Outer margin around the sprite sheet.
     */
    margin?: number;

    /**
     * Spacing between frames.
     */
    spacing?: number;

    /**
     * Number of columns (auto-calculated if not provided).
     */
    columns?: number;

    /**
     * Number of rows (auto-calculated if not provided).
     */
    rows?: number;
}

/**
 * SpriteSheet class for parsing sprite atlases.
 *
 * A sprite sheet is a single image containing multiple frames
 * arranged in a grid pattern.
 *
 * @example
 * ```typescript
 * const sheet = new SpriteSheet({
 *   image: playerImage,
 *   frameWidth: 32,
 *   frameHeight: 32,
 *   frameCount: 8,
 * });
 *
 * const walkFrames = sheet.getFrames(0, 3); // Frames 0-3
 * const jumpFrames = sheet.getFrames(4, 7); // Frames 4-7
 * ```
 */
export class SpriteSheet {
    private _image: SkImage;
    private _frameWidth: number;
    private _frameHeight: number;
    private _frameCount: number;
    private _margin: number;
    private _spacing: number;
    private _columns: number;
    private _rows: number;
    private _frames: SpriteFrame[] = [];

    constructor(config: SpriteSheetConfig) {
        this._image = config.image;
        this._frameWidth = config.frameWidth;
        this._frameHeight = config.frameHeight;
        this._margin = config.margin ?? 0;
        this._spacing = config.spacing ?? 0;

        // Calculate grid dimensions
        const imageWidth = this._image.width();
        const imageHeight = this._image.height();

        const usableWidth = imageWidth - this._margin * 2;
        const usableHeight = imageHeight - this._margin * 2;

        this._columns =
            config.columns ??
            Math.floor((usableWidth + this._spacing) / (this._frameWidth + this._spacing));

        this._rows =
            config.rows ??
            Math.floor((usableHeight + this._spacing) / (this._frameHeight + this._spacing));

        const maxFrames = this._columns * this._rows;
        this._frameCount = config.frameCount ?? maxFrames;

        // Pre-calculate all frame rectangles
        this._buildFrames();
    }

    /**
     * Build frame data for all frames.
     */
    private _buildFrames(): void {
        this._frames = [];

        for (let i = 0; i < this._frameCount; i++) {
            const col = i % this._columns;
            const row = Math.floor(i / this._columns);

            const x = this._margin + col * (this._frameWidth + this._spacing);
            const y = this._margin + row * (this._frameHeight + this._spacing);

            this._frames.push({
                image: this._image,
                sourceRect: new Rect(x, y, this._frameWidth, this._frameHeight),
            });
        }
    }

    // ===============================
    // Getters
    // ===============================

    get image(): SkImage {
        return this._image;
    }

    get frameWidth(): number {
        return this._frameWidth;
    }

    get frameHeight(): number {
        return this._frameHeight;
    }

    get frameCount(): number {
        return this._frameCount;
    }

    get columns(): number {
        return this._columns;
    }

    get rows(): number {
        return this._rows;
    }

    // ===============================
    // Frame access
    // ===============================

    /**
     * Get a single frame by index.
     */
    getFrame(index: number): SpriteFrame {
        if (index < 0 || index >= this._frameCount) {
            throw new Error(`Frame index ${index} out of range (0-${this._frameCount - 1})`);
        }
        return this._frames[index];
    }

    /**
     * Get a range of frames (inclusive).
     */
    getFrames(start: number, end: number): SpriteFrame[] {
        if (start < 0 || end >= this._frameCount || start > end) {
            throw new Error(`Invalid frame range: ${start}-${end}`);
        }
        return this._frames.slice(start, end + 1);
    }

    /**
     * Get all frames.
     */
    getAllFrames(): SpriteFrame[] {
        return [...this._frames];
    }

    /**
     * Get frames by row.
     */
    getRow(row: number): SpriteFrame[] {
        if (row < 0 || row >= this._rows) {
            throw new Error(`Row ${row} out of range (0-${this._rows - 1})`);
        }

        const start = row * this._columns;
        const end = Math.min(start + this._columns - 1, this._frameCount - 1);
        return this._frames.slice(start, end + 1);
    }

    /**
     * Get frames by column.
     */
    getColumn(col: number): SpriteFrame[] {
        if (col < 0 || col >= this._columns) {
            throw new Error(`Column ${col} out of range (0-${this._columns - 1})`);
        }

        const frames: SpriteFrame[] = [];
        for (let row = 0; row < this._rows; row++) {
            const index = row * this._columns + col;
            if (index < this._frameCount) {
                frames.push(this._frames[index]);
            }
        }
        return frames;
    }

    /**
     * Create animation frames with custom timing.
     */
    createAnimation(
        frameIndices: number[],
        durations?: number[]
    ): SpriteFrame[] {
        return frameIndices.map((index, i) => {
            const frame = this.getFrame(index);
            return {
                ...frame,
                duration: durations?.[i],
            };
        });
    }

    toString(): string {
        return `SpriteSheet(${this._frameWidth}x${this._frameHeight}, ${this._frameCount} frames)`;
    }
}
