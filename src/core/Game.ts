import { Scene } from './Scene';
import { GameLoop, GameLoopState } from './GameLoop';
import { Renderer } from '../rendering/Renderer';
import { Camera } from '../rendering/Camera';
import { TouchInput } from '../input/TouchInput';
import { KeyboardInput } from '../input/KeyboardInput';
import { Time } from '../utils/Time';
import { Logger } from '../utils/Logger';
import type { SkCanvas } from '@shopify/react-native-skia';
import { Platform } from 'react-native';

/**
 * Game configuration options.
 */
export interface GameConfig {
    /**
     * Game world width in pixels.
     */
    width: number;

    /**
     * Game world height in pixels.
     */
    height: number;

    /**
     * Background color (hex string).
     */
    backgroundColor?: string;

    /**
     * Target frames per second.
     * @default 60
     */
    targetFPS?: number;

    /**
     * Enable debug mode.
     * Shows FPS counter and other debug info.
     */
    debug?: boolean;
}

/**
 * Game class - the engine entry point.
 *
 * This is the main orchestrator that owns:
 * - The game loop
 * - Scene management
 * - Renderer
 * - Input systems
 */
export class Game {
    // ===============================
    // Configuration
    // ===============================

    public readonly config: Readonly<GameConfig>;

    private _width: number;
    private _height: number;
    private _backgroundColor: string;

    // ===============================
    // Core systems
    // ===============================

    private _gameLoop: GameLoop;
    private _renderer: Renderer | null = null;
    private _camera: Camera;
    private _touchInput: TouchInput;
    private _keyboardInput: KeyboardInput;

    // ===============================
    // Scene management
    // ===============================

    private _currentScene: Scene | null = null;
    private _nextScene: Scene | null = null;
    private _isTransitioning: boolean = false;

    // ===============================
    // State
    // ===============================

    private _initialized: boolean = false;
    private _canvas: SkCanvas | null = null;

    constructor(config: GameConfig) {
        this.config = Object.freeze({ ...config });

        this._width = config.width;
        this._height = config.height;
        this._backgroundColor = config.backgroundColor ?? '#000000';

        // Create core systems
        this._gameLoop = new GameLoop();
        this._camera = new Camera(this._width, this._height);
        this._touchInput = new TouchInput();
        this._keyboardInput = new KeyboardInput();

        // Setup web keyboard listeners if on web
        if (Platform.OS === 'web') {
            this._keyboardInput.setupWebListeners();
        }

        // Set target FPS
        if (config.targetFPS) {
            this._gameLoop.setFPS(config.targetFPS);
        }

        // Set debug mode
        if (config.debug) {
            Logger.setLevel('debug');
        }

        // Setup game loop callbacks
        this._gameLoop.onFrame(this._onFrame.bind(this));
        this._gameLoop.onFixedUpdate(this._onFixedUpdate.bind(this));

        Logger.info('Game created', { width: this._width, height: this._height, platform: Platform.OS });
    }

    // ===============================
    // Getters
    // ===============================

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }

    get backgroundColor(): string {
        return this._backgroundColor;
    }

    get camera(): Camera {
        return this._camera;
    }

    get touchInput(): TouchInput {
        return this._touchInput;
    }

    get keyboard(): KeyboardInput {
        return this._keyboardInput;
    }

    get renderer(): Renderer | null {
        return this._renderer;
    }

    get currentScene(): Scene | null {
        return this._currentScene;
    }

    get isRunning(): boolean {
        return this._gameLoop.isRunning;
    }

    get isPaused(): boolean {
        return this._gameLoop.isPaused;
    }

    // ===============================
    // Lifecycle
    // ===============================

    /**
     * Start the game.
     * Must be called after setting a scene.
     */
    start(): void {
        if (this._gameLoop.state !== GameLoopState.Stopped) {
            Logger.warn('Game is already running');
            return;
        }

        Logger.info('Game starting');
        this._gameLoop.start();
    }

    /**
     * Stop the game completely.
     */
    stop(): void {
        Logger.info('Game stopping');

        // Unload current scene
        if (this._currentScene) {
            this._currentScene._unload();
            this._currentScene = null;
        }

        // Cleanup keyboard listeners
        if (Platform.OS === 'web') {
            this._keyboardInput.removeWebListeners();
        }

        this._gameLoop.stop();
        Time.reset();
    }

    /**
     * Pause the game.
     * The game loop keeps running but updates are skipped.
     */
    pause(): void {
        if (this._currentScene) {
            this._currentScene._pause();
        }
        this._gameLoop.pause();
    }

    /**
     * Resume the game.
     */
    resume(): void {
        this._gameLoop.resume();
        if (this._currentScene) {
            this._currentScene._resume();
        }
    }

    // ===============================
    // Scene management
    // ===============================

    /**
     * Set the current scene.
     * The scene will be loaded asynchronously.
     */
    async setScene(scene: Scene): Promise<void> {
        if (this._isTransitioning) {
            Logger.warn('Scene transition already in progress');
            return;
        }

        this._isTransitioning = true;
        this._nextScene = scene;

        try {
            // Unload current scene
            if (this._currentScene) {
                this._currentScene._unload();
            }

            // Load new scene
            this._currentScene = scene;
            await scene._load();
        } catch (error) {
            Logger.error('Failed to load scene', error);
            throw error;
        } finally {
            this._isTransitioning = false;
            this._nextScene = null;
        }
    }

    /**
     * Push a scene on top (for overlays/menus).
     * Not implemented in base version - use setScene for now.
     */
    pushScene(_scene: Scene): void {
        Logger.warn('pushScene not implemented - use setScene');
    }

    /**
     * Pop the top scene.
     */
    popScene(): void {
        Logger.warn('popScene not implemented - use setScene');
    }

    // ===============================
    // Canvas integration
    // ===============================

    /**
     * Set the Skia canvas.
     * Called by BlazeCanvas when the canvas is ready.
     * @internal
     */
    _setCanvas(canvas: SkCanvas | null): void {
        this._canvas = canvas;

        if (canvas) {
            this._renderer = new Renderer(canvas, this._camera, this._width, this._height);
            this._initialized = true;
            Logger.info('Canvas initialized');
        } else {
            this._renderer = null;
            this._initialized = false;
        }
    }

    /**
     * Handle touch start event from BlazeCanvas.
     * @internal
     */
    _handleTouchStart(x: number, y: number, id: number): void {
        this._touchInput._handleTouchStart(x, y, id);
    }

    /**
     * Handle touch move event from BlazeCanvas.
     * @internal
     */
    _handleTouchMove(x: number, y: number, id: number): void {
        this._touchInput._handleTouchMove(x, y, id);
    }

    /**
     * Handle touch end event from BlazeCanvas.
     * @internal
     */
    _handleTouchEnd(id: number): void {
        this._touchInput._handleTouchEnd(id);
    }

    // ===============================
    // Game loop callbacks
    // ===============================

    private _onFrame(dt: number): void {
        // Poll input (for frame-safe access)
        this._touchInput._poll();
        this._keyboardInput._poll();

        // Update camera
        this._camera.update(dt);

        // Update current scene
        if (this._currentScene && !this._isTransitioning) {
            this._currentScene._update(dt);
        }

        // Render
        this._render();
    }

    private _onFixedUpdate(_dt: number): void {
        // Fixed update for physics
        // Currently handled by systems with fixed timestep
    }

    private _render(): void {
        if (!this._renderer || !this._canvas || !this._initialized) {
            return;
        }

        // Begin frame
        this._renderer.beginFrame();

        // Clear background
        this._renderer.clear(this._backgroundColor);

        // Render current scene
        if (this._currentScene) {
            this._currentScene._render(this._renderer);
        }

        // Debug overlay
        if (this.config.debug) {
            this._renderDebugOverlay();
        }

        // End frame
        this._renderer.endFrame();
    }

    private _renderDebugOverlay(): void {
        if (!this._renderer) return;

        const fps = `FPS: ${Time.fps}`;
        const entities = `Entities: ${this._currentScene?.entityCount ?? 0}`;

        this._renderer.drawText(fps, 10, 20, {
            color: '#00ff00',
            fontSize: 12,
        });
        this._renderer.drawText(entities, 10, 36, {
            color: '#00ff00',
            fontSize: 12,
        });
    }
}
