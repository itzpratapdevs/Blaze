import { Vector2 } from '../math/Vector2';

/**
 * Swipe direction.
 */
export enum SwipeDirection {
    Up = 'up',
    Down = 'down',
    Left = 'left',
    Right = 'right',
}

/**
 * Gesture callback types.
 */
export type TapCallback = (x: number, y: number) => void;
export type LongPressCallback = (x: number, y: number) => void;
export type SwipeCallback = (direction: SwipeDirection, velocity: number) => void;
export type PinchCallback = (scale: number, center: Vector2) => void;
export type PanCallback = (delta: Vector2, position: Vector2) => void;

/**
 * Gesture state for tracking.
 */
interface GestureState {
    startX: number;
    startY: number;
    startTime: number;
    currentX: number;
    currentY: number;
    isActive: boolean;
}

/**
 * GestureRecognizer for advanced gesture detection.
 *
 * @example
 * ```typescript
 * const gestures = new GestureRecognizer();
 *
 * gestures.onTap((x, y) => {
 *   console.log(`Tap at ${x}, ${y}`);
 * });
 *
 * gestures.onSwipe((direction, velocity) => {
 *   console.log(`Swipe ${direction} at ${velocity}`);
 * });
 *
 * gestures.onLongPress((x, y) => {
 *   console.log(`Long press at ${x}, ${y}`);
 * });
 * ```
 */
export class GestureRecognizer {
    // Configuration
    private _tapThreshold: number = 10; // max distance for tap
    private _tapTimeout: number = 200; // max duration for tap (ms)
    private _longPressThreshold: number = 500; // min duration for long press (ms)
    private _swipeThreshold: number = 50; // min distance for swipe
    private _swipeVelocityThreshold: number = 0.3; // min velocity for swipe (px/ms)

    // State
    private _state: GestureState | null = null;
    private _longPressTimer: any = null;
    private _lastPinchDistance: number = 0;

    // Callbacks
    private _tapCallbacks: TapCallback[] = [];
    private _longPressCallbacks: LongPressCallback[] = [];
    private _swipeCallbacks: SwipeCallback[] = [];
    private _pinchCallbacks: PinchCallback[] = [];
    private _panCallbacks: PanCallback[] = [];

    // ===============================
    // Configuration
    // ===============================

    /**
     * Set tap threshold (max distance for tap).
     */
    setTapThreshold(pixels: number): this {
        this._tapThreshold = pixels;
        return this;
    }

    /**
     * Set tap timeout (max duration in ms).
     */
    setTapTimeout(ms: number): this {
        this._tapTimeout = ms;
        return this;
    }

    /**
     * Set long press threshold (min duration in ms).
     */
    setLongPressThreshold(ms: number): this {
        this._longPressThreshold = ms;
        return this;
    }

    /**
     * Set swipe threshold (min distance).
     */
    setSwipeThreshold(pixels: number): this {
        this._swipeThreshold = pixels;
        return this;
    }

    // ===============================
    // Register callbacks
    // ===============================

    /**
     * Register a tap callback.
     * Returns unsubscribe function.
     */
    onTap(callback: TapCallback): () => void {
        this._tapCallbacks.push(callback);
        return () => {
            const i = this._tapCallbacks.indexOf(callback);
            if (i >= 0) this._tapCallbacks.splice(i, 1);
        };
    }

    /**
     * Register a long press callback.
     * Returns unsubscribe function.
     */
    onLongPress(callback: LongPressCallback): () => void {
        this._longPressCallbacks.push(callback);
        return () => {
            const i = this._longPressCallbacks.indexOf(callback);
            if (i >= 0) this._longPressCallbacks.splice(i, 1);
        };
    }

    /**
     * Register a swipe callback.
     * Returns unsubscribe function.
     */
    onSwipe(callback: SwipeCallback): () => void {
        this._swipeCallbacks.push(callback);
        return () => {
            const i = this._swipeCallbacks.indexOf(callback);
            if (i >= 0) this._swipeCallbacks.splice(i, 1);
        };
    }

    /**
     * Register a pinch callback.
     * Returns unsubscribe function.
     */
    onPinch(callback: PinchCallback): () => void {
        this._pinchCallbacks.push(callback);
        return () => {
            const i = this._pinchCallbacks.indexOf(callback);
            if (i >= 0) this._pinchCallbacks.splice(i, 1);
        };
    }

    /**
     * Register a pan/drag callback.
     * Returns unsubscribe function.
     */
    onPan(callback: PanCallback): () => void {
        this._panCallbacks.push(callback);
        return () => {
            const i = this._panCallbacks.indexOf(callback);
            if (i >= 0) this._panCallbacks.splice(i, 1);
        };
    }

    // ===============================
    // Event handling
    // ===============================

    /**
     * Handle touch start.
     */
    handleTouchStart(x: number, y: number): void {
        this._state = {
            startX: x,
            startY: y,
            startTime: Date.now(),
            currentX: x,
            currentY: y,
            isActive: true,
        };

        // Start long press timer
        this._clearLongPressTimer();
        this._longPressTimer = setTimeout(() => {
            if (this._state && this._state.isActive) {
                const dx = this._state.currentX - this._state.startX;
                const dy = this._state.currentY - this._state.startY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this._tapThreshold) {
                    this._emitLongPress(this._state.startX, this._state.startY);
                }
            }
        }, this._longPressThreshold);
    }

    /**
     * Handle touch move.
     */
    handleTouchMove(x: number, y: number): void {
        if (!this._state) return;

        const prevX = this._state.currentX;
        const prevY = this._state.currentY;

        this._state.currentX = x;
        this._state.currentY = y;

        // Emit pan
        const delta = new Vector2(x - prevX, y - prevY);
        const position = new Vector2(x, y);
        this._emitPan(delta, position);

        // Cancel long press if moved too far
        const dx = x - this._state.startX;
        const dy = y - this._state.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > this._tapThreshold) {
            this._clearLongPressTimer();
        }
    }

    /**
     * Handle touch end.
     */
    handleTouchEnd(x: number, y: number): void {
        if (!this._state) return;

        this._clearLongPressTimer();

        const state = this._state;
        state.currentX = x;
        state.currentY = y;
        state.isActive = false;

        const dx = x - state.startX;
        const dy = y - state.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const duration = Date.now() - state.startTime;

        // Check for tap
        if (distance < this._tapThreshold && duration < this._tapTimeout) {
            this._emitTap(x, y);
        }
        // Check for swipe
        else if (distance > this._swipeThreshold) {
            const velocity = distance / duration;
            if (velocity > this._swipeVelocityThreshold) {
                const direction = this._getSwipeDirection(dx, dy);
                this._emitSwipe(direction, velocity);
            }
        }

        this._state = null;
    }

    /**
     * Handle pinch (two-finger gesture).
     */
    handlePinch(touch1: Vector2, touch2: Vector2): void {
        const dx = touch2.x - touch1.x;
        const dy = touch2.y - touch1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (this._lastPinchDistance > 0) {
            const scale = distance / this._lastPinchDistance;
            const center = new Vector2(
                (touch1.x + touch2.x) / 2,
                (touch1.y + touch2.y) / 2
            );
            this._emitPinch(scale, center);
        }

        this._lastPinchDistance = distance;
    }

    /**
     * Reset pinch tracking.
     */
    resetPinch(): void {
        this._lastPinchDistance = 0;
    }

    /**
     * Cancel current gesture.
     */
    cancel(): void {
        this._clearLongPressTimer();
        this._state = null;
        this._lastPinchDistance = 0;
    }

    // ===============================
    // Private helpers
    // ===============================

    private _clearLongPressTimer(): void {
        if (this._longPressTimer) {
            clearTimeout(this._longPressTimer);
            this._longPressTimer = null;
        }
    }

    private _getSwipeDirection(dx: number, dy: number): SwipeDirection {
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        if (absDx > absDy) {
            return dx > 0 ? SwipeDirection.Right : SwipeDirection.Left;
        } else {
            return dy > 0 ? SwipeDirection.Down : SwipeDirection.Up;
        }
    }

    private _emitTap(x: number, y: number): void {
        for (const cb of this._tapCallbacks) {
            cb(x, y);
        }
    }

    private _emitLongPress(x: number, y: number): void {
        for (const cb of this._longPressCallbacks) {
            cb(x, y);
        }
    }

    private _emitSwipe(direction: SwipeDirection, velocity: number): void {
        for (const cb of this._swipeCallbacks) {
            cb(direction, velocity);
        }
    }

    private _emitPinch(scale: number, center: Vector2): void {
        for (const cb of this._pinchCallbacks) {
            cb(scale, center);
        }
    }

    private _emitPan(delta: Vector2, position: Vector2): void {
        for (const cb of this._panCallbacks) {
            cb(delta, position);
        }
    }

    // ===============================
    // Cleanup
    // ===============================

    /**
     * Remove all callbacks.
     */
    removeAllCallbacks(): void {
        this._tapCallbacks = [];
        this._longPressCallbacks = [];
        this._swipeCallbacks = [];
        this._pinchCallbacks = [];
        this._panCallbacks = [];
    }

    /**
     * Dispose the recognizer.
     */
    dispose(): void {
        this.cancel();
        this.removeAllCallbacks();
    }
}
