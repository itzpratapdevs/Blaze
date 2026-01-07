/**
 * Key state for tracking press/release.
 */
interface KeyState {
    down: boolean;
    justPressed: boolean;
    justReleased: boolean;
}

/**
 * Keyboard input manager.
 *
 * Primarily useful for:
 * - Desktop/emulator testing
 * - External keyboard support
 * - Hardware buttons
 */
export class KeyboardInput {
    // Current key states
    private _keys: Map<string, KeyState> = new Map();

    // Keys pressed this frame
    private _justPressed: Set<string> = new Set();

    // Keys released this frame
    private _justReleased: Set<string> = new Set();

    // Listener cleanup
    private _cleanup: (() => void) | null = null;

    constructor() {
        // Note: In React Native, keyboard events are typically handled differently
        // This is more for web/testing environments
    }

    // ===============================
    // State queries
    // ===============================

    /**
     * Check if a key is currently held down.
     */
    isKeyDown(key: string): boolean {
        const state = this._keys.get(key.toLowerCase());
        return state?.down ?? false;
    }

    /**
     * Check if a key was just pressed this frame.
     */
    isKeyPressed(key: string): boolean {
        return this._justPressed.has(key.toLowerCase());
    }

    /**
     * Check if a key was just released this frame.
     */
    isKeyReleased(key: string): boolean {
        return this._justReleased.has(key.toLowerCase());
    }

    /**
     * Check if any key is currently down.
     */
    isAnyKeyDown(): boolean {
        for (const state of this._keys.values()) {
            if (state.down) return true;
        }
        return false;
    }

    /**
     * Get all currently pressed keys.
     */
    getDownKeys(): string[] {
        const keys: string[] = [];
        this._keys.forEach((state, key) => {
            if (state.down) keys.push(key);
        });
        return keys;
    }

    // ===============================
    // Common key helpers
    // ===============================

    /**
     * Get horizontal axis (-1 to 1).
     * Uses arrow keys and WASD.
     */
    getHorizontal(): number {
        let axis = 0;
        if (this.isKeyDown('arrowleft') || this.isKeyDown('a')) axis -= 1;
        if (this.isKeyDown('arrowright') || this.isKeyDown('d')) axis += 1;
        return axis;
    }

    /**
     * Get vertical axis (-1 to 1).
     * Uses arrow keys and WASD.
     */
    getVertical(): number {
        let axis = 0;
        if (this.isKeyDown('arrowup') || this.isKeyDown('w')) axis -= 1;
        if (this.isKeyDown('arrowdown') || this.isKeyDown('s')) axis += 1;
        return axis;
    }

    /**
     * Check if a common action key is pressed.
     */
    isActionPressed(): boolean {
        return (
            this.isKeyPressed('space') ||
            this.isKeyPressed('enter') ||
            this.isKeyPressed('z') ||
            this.isKeyPressed('x')
        );
    }

    /**
     * Check if escape/back is pressed.
     */
    isBackPressed(): boolean {
        return this.isKeyPressed('escape') || this.isKeyPressed('backspace');
    }

    // ===============================
    // Internal methods
    // ===============================

    /**
     * @internal Called at the start of each frame.
     */
    _poll(): void {
        // Clear per-frame flags
        this._justPressed.clear();
        this._justReleased.clear();

        // Update states
        this._keys.forEach((state) => {
            state.justPressed = false;
            state.justReleased = false;
        });
    }

    /**
     * @internal Handle key down event.
     */
    _handleKeyDown(key: string): void {
        const normalizedKey = key.toLowerCase();
        const state = this._keys.get(normalizedKey);

        if (!state) {
            // New key
            this._keys.set(normalizedKey, {
                down: true,
                justPressed: true,
                justReleased: false,
            });
            this._justPressed.add(normalizedKey);
        } else if (!state.down) {
            // Key was up, now down
            state.down = true;
            state.justPressed = true;
            this._justPressed.add(normalizedKey);
        }
        // If already down, do nothing (key repeat)
    }

    /**
     * @internal Handle key up event.
     */
    _handleKeyUp(key: string): void {
        const normalizedKey = key.toLowerCase();
        const state = this._keys.get(normalizedKey);

        if (state && state.down) {
            state.down = false;
            state.justReleased = true;
            this._justReleased.add(normalizedKey);
        }
    }

    /**
     * @internal Simulate a key press (for testing).
     */
    _simulateKeyPress(key: string): void {
        this._handleKeyDown(key);
        // Will be released on next poll
    }

    /**
     * @internal Clear all key states.
     */
    _clear(): void {
        this._keys.clear();
        this._justPressed.clear();
        this._justReleased.clear();
    }

    /**
     * Setup web keyboard listeners (for testing/web).
     * Not typically used in React Native.
     */
    setupWebListeners(): void {
        if (typeof document === 'undefined') return;

        const onKeyDown = (e: KeyboardEvent) => {
            this._handleKeyDown(e.key);
        };

        const onKeyUp = (e: KeyboardEvent) => {
            this._handleKeyUp(e.key);
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);

        this._cleanup = () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
        };
    }

    /**
     * Remove web keyboard listeners.
     */
    removeWebListeners(): void {
        this._cleanup?.();
        this._cleanup = null;
    }
}
