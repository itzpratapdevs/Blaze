import { Vector2 } from '../math/Vector2';

/**
 * Represents a touch point.
 */
export interface TouchPoint {
    /**
     * Touch identifier.
     */
    id: number;

    /**
     * Current X position (screen coordinates).
     */
    x: number;

    /**
     * Current Y position (screen coordinates).
     */
    y: number;

    /**
     * Starting X position when touch began.
     */
    startX: number;

    /**
     * Starting Y position when touch began.
     */
    startY: number;

    /**
     * Delta X since last frame.
     */
    deltaX: number;

    /**
     * Delta Y since last frame.
     */
    deltaY: number;

    /**
     * Whether this is a new touch this frame.
     */
    justStarted: boolean;

    /**
     * Whether this touch just ended this frame.
     */
    justEnded: boolean;

    /**
     * Time when touch started (milliseconds).
     */
    startTime: number;
}

/**
 * Touch phase for event handling.
 */
export enum TouchPhase {
    Began = 'began',
    Moved = 'moved',
    Ended = 'ended',
    Cancelled = 'cancelled',
}

/**
 * Touch event callback.
 */
export type TouchCallback = (touch: TouchPoint, phase: TouchPhase) => void;

/**
 * Touch input manager.
 *
 * Provides frame-safe access to touch state.
 * Uses polling pattern - check state in update(), not via callbacks.
 */
export class TouchInput {
    // Active touches
    private _touches: Map<number, TouchPoint> = new Map();

    // Touches from previous frame (for delta calculation)
    private _prevTouches: Map<number, { x: number; y: number }> = new Map();

    // Touches that just started this frame
    private _justStarted: Set<number> = new Set();

    // Touches that just ended this frame
    private _justEnded: Map<number, TouchPoint> = new Map();

    // Event callbacks (optional)
    private _callbacks: TouchCallback[] = [];

    // ===============================
    // State queries
    // ===============================

    /**
     * Get all active touches.
     */
    get touches(): ReadonlyMap<number, TouchPoint> {
        return this._touches;
    }

    /**
     * Get the number of active touches.
     */
    get touchCount(): number {
        return this._touches.size;
    }

    /**
     * Check if there are any active touches.
     */
    isTouching(): boolean {
        return this._touches.size > 0;
    }

    /**
     * Get a specific touch by ID.
     */
    getTouch(id: number): TouchPoint | undefined {
        return this._touches.get(id);
    }

    /**
     * Get the primary (first) touch.
     */
    getPrimaryTouch(): TouchPoint | undefined {
        if (this._touches.size === 0) return undefined;
        return this._touches.values().next().value;
    }

    /**
     * Get all touch positions as vectors.
     */
    getTouchPositions(): Vector2[] {
        const positions: Vector2[] = [];
        this._touches.forEach((touch) => {
            positions.push(new Vector2(touch.x, touch.y));
        });
        return positions;
    }

    /**
     * Check if a touch just started this frame.
     */
    justTouched(id?: number): boolean {
        if (id !== undefined) {
            return this._justStarted.has(id);
        }
        return this._justStarted.size > 0;
    }

    /**
     * Check if a touch just ended this frame.
     */
    justReleased(id?: number): boolean {
        if (id !== undefined) {
            return this._justEnded.has(id);
        }
        return this._justEnded.size > 0;
    }

    /**
     * Get a touch that just ended (for tap detection).
     */
    getEndedTouch(id: number): TouchPoint | undefined {
        return this._justEnded.get(id);
    }

    /**
     * Check if a point is being touched (within radius).
     */
    isTouchingPoint(x: number, y: number, radius: number = 50): boolean {
        for (const touch of this._touches.values()) {
            const dx = touch.x - x;
            const dy = touch.y - y;
            if (dx * dx + dy * dy <= radius * radius) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if a rectangle is being touched.
     */
    isTouchingRect(
        x: number,
        y: number,
        width: number,
        height: number
    ): boolean {
        for (const touch of this._touches.values()) {
            if (
                touch.x >= x &&
                touch.x <= x + width &&
                touch.y >= y &&
                touch.y <= y + height
            ) {
                return true;
            }
        }
        return false;
    }

    // ===============================
    // Gesture helpers
    // ===============================

    /**
     * Get the drag delta for a touch.
     */
    getDragDelta(id: number = 0): Vector2 | undefined {
        const touch = this._touches.get(id);
        if (!touch) return undefined;
        return new Vector2(touch.deltaX, touch.deltaY);
    }

    /**
     * Get the total drag from start position.
     */
    getTotalDrag(id: number = 0): Vector2 | undefined {
        const touch = this._touches.get(id);
        if (!touch) return undefined;
        return new Vector2(touch.x - touch.startX, touch.y - touch.startY);
    }

    /**
     * Get the distance dragged from start.
     */
    getDragDistance(id: number = 0): number {
        const drag = this.getTotalDrag(id);
        return drag ? drag.magnitude() : 0;
    }

    /**
     * Check if a touch is a tap (short duration, small movement).
     */
    isTap(id: number = 0, maxDuration: number = 300, maxDistance: number = 20): boolean {
        const touch = this._justEnded.get(id);
        if (!touch) return false;

        const duration = performance.now() - touch.startTime;
        const dx = touch.x - touch.startX;
        const dy = touch.y - touch.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return duration <= maxDuration && distance <= maxDistance;
    }

    /**
     * Get pinch distance (for two-finger zoom).
     */
    getPinchDistance(): number | undefined {
        if (this._touches.size < 2) return undefined;

        const touches = Array.from(this._touches.values());
        const t1 = touches[0];
        const t2 = touches[1];

        const dx = t2.x - t1.x;
        const dy = t2.y - t1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Get pinch center point.
     */
    getPinchCenter(): Vector2 | undefined {
        if (this._touches.size < 2) return undefined;

        const touches = Array.from(this._touches.values());
        const t1 = touches[0];
        const t2 = touches[1];

        return new Vector2((t1.x + t2.x) / 2, (t1.y + t2.y) / 2);
    }

    // ===============================
    // Event callbacks (optional)
    // ===============================

    /**
     * Add a touch event callback.
     */
    onTouch(callback: TouchCallback): () => void {
        this._callbacks.push(callback);
        return () => {
            const index = this._callbacks.indexOf(callback);
            if (index !== -1) {
                this._callbacks.splice(index, 1);
            }
        };
    }

    // ===============================
    // Internal methods (called by Game)
    // ===============================

    /**
     * @internal Called at the start of each frame.
     * Clears per-frame state.
     */
    _poll(): void {
        // Clear per-frame flags
        this._justStarted.clear();
        this._justEnded.clear();

        // Update previous positions
        this._prevTouches.clear();
        this._touches.forEach((touch, id) => {
            this._prevTouches.set(id, { x: touch.x, y: touch.y });
            touch.justStarted = false;
            touch.justEnded = false;
            touch.deltaX = 0;
            touch.deltaY = 0;
        });
    }

    /**
     * @internal Handle touch start.
     */
    _handleTouchStart(x: number, y: number, id: number): void {
        const touch: TouchPoint = {
            id,
            x,
            y,
            startX: x,
            startY: y,
            deltaX: 0,
            deltaY: 0,
            justStarted: true,
            justEnded: false,
            startTime: performance.now(),
        };

        this._touches.set(id, touch);
        this._justStarted.add(id);

        // Notify callbacks
        this._notifyCallbacks(touch, TouchPhase.Began);
    }

    /**
     * @internal Handle touch move.
     */
    _handleTouchMove(x: number, y: number, id: number): void {
        const touch = this._touches.get(id);
        if (!touch) return;

        const prev = this._prevTouches.get(id);
        if (prev) {
            touch.deltaX = x - prev.x;
            touch.deltaY = y - prev.y;
        }

        touch.x = x;
        touch.y = y;

        // Notify callbacks
        this._notifyCallbacks(touch, TouchPhase.Moved);
    }

    /**
     * @internal Handle touch end.
     */
    _handleTouchEnd(id: number): void {
        const touch = this._touches.get(id);
        if (!touch) return;

        touch.justEnded = true;
        this._justEnded.set(id, { ...touch });
        this._touches.delete(id);
        this._prevTouches.delete(id);

        // Notify callbacks
        this._notifyCallbacks(touch, TouchPhase.Ended);
    }

    /**
     * @internal Handle touch cancel.
     */
    _handleTouchCancel(id: number): void {
        const touch = this._touches.get(id);
        if (touch) {
            this._notifyCallbacks(touch, TouchPhase.Cancelled);
        }
        this._touches.delete(id);
        this._prevTouches.delete(id);
    }

    /**
     * @internal Notify all callbacks.
     */
    private _notifyCallbacks(touch: TouchPoint, phase: TouchPhase): void {
        for (const callback of this._callbacks) {
            callback(touch, phase);
        }
    }

    /**
     * @internal Clear all touches.
     */
    _clear(): void {
        this._touches.clear();
        this._prevTouches.clear();
        this._justStarted.clear();
        this._justEnded.clear();
    }
}
