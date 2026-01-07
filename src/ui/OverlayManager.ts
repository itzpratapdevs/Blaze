import type { Game } from '../core/Game';

/**
 * Overlay configuration.
 */
export interface OverlayConfig {
    /**
     * Unique name for this overlay.
     */
    name: string;

    /**
     * React component to render.
     */
    component: React.ComponentType<OverlayProps>;

    /**
     * If true, pause game when overlay is shown.
     */
    modal?: boolean;

    /**
     * If true, overlay background is transparent.
     */
    transparent?: boolean;

    /**
     * Z-index for stacking (higher = on top).
     */
    zIndex?: number;
}

/**
 * Props passed to overlay components.
 */
export interface OverlayProps {
    /**
     * Reference to the game instance.
     */
    game: Game;

    /**
     * Close this overlay.
     */
    onClose: () => void;

    /**
     * Overlay name.
     */
    name: string;

    /**
     * Custom data passed when showing the overlay.
     */
    data?: any;
}

/**
 * Active overlay instance.
 */
interface ActiveOverlay {
    config: OverlayConfig;
    data?: any;
}

/**
 * OverlayManager for handling UI layers above the game canvas.
 *
 * Overlays are React Native components rendered above the game.
 * Common uses include pause menus, HUD, dialogs, etc.
 *
 * @example
 * ```typescript
 * // Register overlays
 * game.overlays.register({
 *   name: 'pause',
 *   component: PauseMenu,
 *   modal: true,
 * });
 *
 * game.overlays.register({
 *   name: 'hud',
 *   component: GameHUD,
 *   modal: false,
 * });
 *
 * // Show/hide
 * game.overlays.show('pause');
 * game.overlays.hide('pause');
 * ```
 */
export class OverlayManager {
    private _game: Game;
    private _registered: Map<string, OverlayConfig> = new Map();
    private _active: Map<string, ActiveOverlay> = new Map();
    private _listeners: Set<() => void> = new Set();

    constructor(game: Game) {
        this._game = game;
    }

    // ===============================
    // Registration
    // ===============================

    /**
     * Register an overlay.
     */
    register(config: OverlayConfig): this {
        this._registered.set(config.name, {
            ...config,
            zIndex: config.zIndex ?? 0,
        });
        return this;
    }

    /**
     * Unregister an overlay.
     */
    unregister(name: string): boolean {
        if (this._active.has(name)) {
            this.hide(name);
        }
        return this._registered.delete(name);
    }

    /**
     * Check if an overlay is registered.
     */
    isRegistered(name: string): boolean {
        return this._registered.has(name);
    }

    /**
     * Get all registered overlay names.
     */
    getRegisteredNames(): string[] {
        return Array.from(this._registered.keys());
    }

    // ===============================
    // Show / Hide
    // ===============================

    /**
     * Show an overlay.
     */
    show(name: string, data?: any): boolean {
        const config = this._registered.get(name);
        if (!config) {
            console.warn(`OverlayManager: Overlay '${name}' not registered`);
            return false;
        }

        // Add to active overlays
        this._active.set(name, { config, data });

        // Pause game if modal
        if (config.modal) {
            this._game.pause();
        }

        this._notifyChange();
        return true;
    }

    /**
     * Hide an overlay.
     */
    hide(name: string): boolean {
        const overlay = this._active.get(name);
        if (!overlay) return false;

        this._active.delete(name);

        // Resume game if this was a modal overlay and no other modals are active
        if (overlay.config.modal && !this.hasModalOverlay()) {
            this._game.resume();
        }

        this._notifyChange();
        return true;
    }

    /**
     * Hide all overlays.
     */
    hideAll(): void {
        const wasModal = this.hasModalOverlay();
        this._active.clear();

        if (wasModal) {
            this._game.resume();
        }

        this._notifyChange();
    }

    /**
     * Toggle an overlay.
     */
    toggle(name: string, data?: any): boolean {
        if (this.isActive(name)) {
            return this.hide(name);
        } else {
            return this.show(name, data);
        }
    }

    // ===============================
    // State queries
    // ===============================

    /**
     * Check if an overlay is currently shown.
     */
    isActive(name: string): boolean {
        return this._active.has(name);
    }

    /**
     * Check if any modal overlay is active.
     */
    hasModalOverlay(): boolean {
        for (const overlay of this._active.values()) {
            if (overlay.config.modal) return true;
        }
        return false;
    }

    /**
     * Check if any overlay is active.
     */
    hasAnyOverlay(): boolean {
        return this._active.size > 0;
    }

    /**
     * Get the number of active overlays.
     */
    get activeCount(): number {
        return this._active.size;
    }

    /**
     * Get all active overlay names.
     */
    getActiveNames(): string[] {
        return Array.from(this._active.keys());
    }

    /**
     * Get active overlays sorted by z-index.
     */
    getActiveOverlays(): ActiveOverlay[] {
        const overlays = Array.from(this._active.values());
        return overlays.sort((a, b) => (a.config.zIndex ?? 0) - (b.config.zIndex ?? 0));
    }

    /**
     * Get the data passed to an active overlay.
     */
    getData(name: string): any {
        return this._active.get(name)?.data;
    }

    /**
     * Update the data for an active overlay.
     */
    setData(name: string, data: any): boolean {
        const overlay = this._active.get(name);
        if (!overlay) return false;

        overlay.data = data;
        this._notifyChange();
        return true;
    }

    // ===============================
    // Change listeners
    // ===============================

    /**
     * Add a listener for overlay changes.
     * Returns a function to remove the listener.
     */
    onChange(callback: () => void): () => void {
        this._listeners.add(callback);
        return () => this._listeners.delete(callback);
    }

    private _notifyChange(): void {
        for (const listener of this._listeners) {
            listener();
        }
    }

    // ===============================
    // React integration helpers
    // ===============================

    /**
     * Create props for an overlay component.
     */
    createProps(name: string): OverlayProps | null {
        const overlay = this._active.get(name);
        if (!overlay) return null;

        return {
            game: this._game,
            name,
            data: overlay.data,
            onClose: () => this.hide(name),
        };
    }
}
