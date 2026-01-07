import { Skia, type SkImage } from '@shopify/react-native-skia';
import { Logger } from '../utils/Logger';

/**
 * Asset loading progress callback.
 */
export type AssetProgressCallback = (loaded: number, total: number) => void;

/**
 * Asset types that can be loaded.
 */
export type AssetType = 'image' | 'data';

/**
 * Asset manifest entry.
 */
export interface AssetManifestEntry {
    name: string;
    path: string;
    type: AssetType;
}

/**
 * Asset loader for preloading and caching game assets.
 *
 * Usage:
 * ```typescript
 * // Preload assets
 * await AssetLoader.load([
 *   { name: 'player', path: require('./player.png'), type: 'image' },
 *   { name: 'enemy', path: require('./enemy.png'), type: 'image' },
 * ]);
 *
 * // Get cached image
 * const playerImage = AssetLoader.getImage('player');
 * ```
 */
export class AssetLoader {
    // Cached images
    private static _images: Map<string, SkImage> = new Map();

    // Cached data (JSON, etc.)
    private static _data: Map<string, unknown> = new Map();

    // Loading state
    private static _loading: boolean = false;
    private static _loaded: number = 0;
    private static _total: number = 0;

    // Progress callback
    private static _onProgress: AssetProgressCallback | null = null;

    // ===============================
    // Loading
    // ===============================

    /**
     * Load multiple assets from a manifest.
     */
    static async load(manifest: AssetManifestEntry[]): Promise<void> {
        if (this._loading) {
            Logger.warn('AssetLoader: Already loading assets');
            return;
        }

        this._loading = true;
        this._loaded = 0;
        this._total = manifest.length;

        Logger.info(`AssetLoader: Loading ${this._total} assets`);

        const promises = manifest.map(async (entry) => {
            try {
                switch (entry.type) {
                    case 'image':
                        await this.loadImage(entry.name, entry.path);
                        break;
                    case 'data':
                        await this.loadData(entry.name, entry.path);
                        break;
                }
                this._loaded++;
                this._onProgress?.(this._loaded, this._total);
            } catch (error) {
                Logger.error(`AssetLoader: Failed to load ${entry.name}`, error);
                throw error;
            }
        });

        await Promise.all(promises);

        this._loading = false;
        Logger.info(`AssetLoader: Loaded ${this._loaded} assets`);
    }

    /**
     * Load a list of image paths.
     * Simple version for common use case.
     */
    static async loadImages(paths: string[]): Promise<void> {
        const manifest = paths.map((path, index) => ({
            name: this._getNameFromPath(path) || `image_${index}`,
            path,
            type: 'image' as AssetType,
        }));

        await this.load(manifest);
    }

    /**
     * Load a single image.
     */
    static async loadImage(name: string, source: string | number): Promise<SkImage | null> {
        // Check if already loaded
        if (this._images.has(name)) {
            return this._images.get(name)!;
        }

        try {
            let image: SkImage | null = null;

            if (typeof source === 'number') {
                // require() source - use Skia's asset loading
                const data = await Skia.Data.fromURI(`asset:${source}`);
                image = Skia.Image.MakeImageFromEncoded(data);
            } else if (typeof source === 'string') {
                if (source.startsWith('http://') || source.startsWith('https://')) {
                    // Remote URL
                    const data = await Skia.Data.fromURI(source);
                    image = Skia.Image.MakeImageFromEncoded(data);
                } else if (source.startsWith('data:')) {
                    // Base64 data URL
                    const base64 = source.split(',')[1];
                    const data = Skia.Data.fromBase64(base64);
                    image = Skia.Image.MakeImageFromEncoded(data);
                } else {
                    // Local file path or asset
                    const data = await Skia.Data.fromURI(source);
                    image = Skia.Image.MakeImageFromEncoded(data);
                }
            }

            if (image) {
                this._images.set(name, image);
                Logger.debug(`AssetLoader: Loaded image '${name}'`);
            } else {
                Logger.warn(`AssetLoader: Failed to decode image '${name}'`);
            }

            return image;
        } catch (error) {
            Logger.error(`AssetLoader: Error loading image '${name}'`, error);
            return null;
        }
    }

    /**
     * Load JSON data.
     */
    static async loadData(name: string, source: string | number): Promise<unknown> {
        if (this._data.has(name)) {
            return this._data.get(name);
        }

        try {
            let data: unknown;

            if (typeof source === 'number') {
                // require() JSON - already resolved
                data = source;
            } else if (typeof source === 'string') {
                if (source.startsWith('http://') || source.startsWith('https://')) {
                    const response = await fetch(source);
                    data = await response.json();
                } else {
                    // Assuming it's already JSON or can be parsed
                    data = JSON.parse(source);
                }
            }

            this._data.set(name, data);
            Logger.debug(`AssetLoader: Loaded data '${name}'`);

            return data;
        } catch (error) {
            Logger.error(`AssetLoader: Error loading data '${name}'`, error);
            return null;
        }
    }

    // ===============================
    // Retrieval
    // ===============================

    /**
     * Get a loaded image by name.
     */
    static getImage(name: string): SkImage | undefined {
        const image = this._images.get(name);
        if (!image) {
            Logger.warn(`AssetLoader: Image '${name}' not found`);
        }
        return image;
    }

    /**
     * Get a loaded image, throwing if not found.
     */
    static requireImage(name: string): SkImage {
        const image = this._images.get(name);
        if (!image) {
            throw new Error(`AssetLoader: Image '${name}' not found`);
        }
        return image;
    }

    /**
     * Get loaded data by name.
     */
    static getData<T = unknown>(name: string): T | undefined {
        return this._data.get(name) as T | undefined;
    }

    /**
     * Check if an asset is loaded.
     */
    static isLoaded(name: string): boolean {
        return this._images.has(name) || this._data.has(name);
    }

    /**
     * Check if an image is loaded.
     */
    static isImageLoaded(name: string): boolean {
        return this._images.has(name);
    }

    // ===============================
    // State
    // ===============================

    /**
     * Check if currently loading.
     */
    static get isLoading(): boolean {
        return this._loading;
    }

    /**
     * Get loading progress (0-1).
     */
    static get progress(): number {
        if (this._total === 0) return 1;
        return this._loaded / this._total;
    }

    /**
     * Set progress callback.
     */
    static set onProgress(callback: AssetProgressCallback | null) {
        this._onProgress = callback;
    }

    // ===============================
    // Management
    // ===============================

    /**
     * Clear all cached assets.
     */
    static clear(): void {
        this._images.clear();
        this._data.clear();
        this._loaded = 0;
        this._total = 0;
        Logger.info('AssetLoader: Cleared all assets');
    }

    /**
     * Clear a specific asset.
     */
    static remove(name: string): boolean {
        const removed = this._images.delete(name) || this._data.delete(name);
        if (removed) {
            Logger.debug(`AssetLoader: Removed '${name}'`);
        }
        return removed;
    }

    /**
     * Get all loaded image names.
     */
    static getImageNames(): string[] {
        return Array.from(this._images.keys());
    }

    /**
     * Get all loaded data names.
     */
    static getDataNames(): string[] {
        return Array.from(this._data.keys());
    }

    /**
     * Get the total count of loaded assets.
     */
    static get count(): number {
        return this._images.size + this._data.size;
    }

    // ===============================
    // Helpers
    // ===============================

    /**
     * Extract name from file path.
     */
    private static _getNameFromPath(path: string): string {
        const parts = path.split('/');
        const filename = parts[parts.length - 1];
        const name = filename.split('.')[0];
        return name || '';
    }
}

/**
 * Alias for convenience.
 */
export const Assets = AssetLoader;
