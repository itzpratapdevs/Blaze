// ============================================
// BLAZE - 2D Game Engine for React Native
// ============================================

/**
 * @packageDocumentation
 * @module blaze
 *
 * Blaze is a lightweight 2D game engine for React Native,
 * inspired by Flutter Flame. Build arcade games, endless runners,
 * quiz games, and gamified experiences with clean TypeScript APIs.
 *
 * @example
 * ```typescript
 * import { Game, Scene, Sprite, AssetLoader, BlazeCanvas } from 'blaze-engine';
 *
 * class MyGameScene extends Scene {
 *   private player!: Sprite;
 *
 *   async onLoad() {
 *     await AssetLoader.loadImages(['player.png']);
 *     this.player = new Sprite({
 *       image: AssetLoader.getImage('player'),
 *       x: 100,
 *       y: 200,
 *     });
 *   }
 *
 *   onUpdate(dt: number) {
 *     this.player.x += 100 * dt;
 *   }
 *
 *   onRender(renderer: Renderer) {
 *     renderer.draw(this.player);
 *   }
 * }
 *
 * const game = new Game({ width: 360, height: 640 });
 * game.setScene(new MyGameScene());
 * game.start();
 * ```
 */

// Core
export { Game, GameConfig } from './core/Game';
export { GameLoop, GameLoopState, FrameCallback, globalGameLoop } from './core/GameLoop';
export { Scene, SceneState } from './core/Scene';
export { Entity } from './core/Entity';
export { Component, ComponentType } from './core/Component';
export { System, RenderSystem } from './core/System';

// Rendering
export { Renderer, TextOptions, CircleOptions, LineOptions } from './rendering/Renderer';
export { Sprite, SpriteOptions, SpriteAnchor } from './rendering/Sprite';
export { Camera } from './rendering/Camera';
export { BlazeCanvas, BlazeCanvasProps } from './rendering/BlazeCanvas';

// Animation (NEW in v0.2.0)
export { SpriteSheet, SpriteSheetConfig, SpriteFrame } from './animation/SpriteSheet';
export { SpriteAnimation, AnimationConfig, AnimationPlayMode } from './animation/SpriteAnimation';
export { AnimatedSprite } from './animation/AnimatedSprite';

// Input
export { TouchInput, TouchPoint, TouchPhase, TouchCallback } from './input/TouchInput';
export { KeyboardInput } from './input/KeyboardInput';
export {
    GestureRecognizer,
    SwipeDirection,
    TapCallback,
    LongPressCallback,
    SwipeCallback,
    PinchCallback,
    PanCallback,
} from './input/GestureRecognizer';

// Collision
export { AABB } from './collision/AABB';
export {
    Collider,
    CollisionLayer,
    CollisionLayers,
    CollisionData,
    CollisionCallback,
} from './collision/Collider';
export { Circle } from './collision/Circle';

// Math
export { Vector2 } from './math/Vector2';
export { Rect } from './math/Rect';

// Assets
export { AssetLoader, Assets, AssetProgressCallback, AssetType } from './assets/AssetLoader';

// Audio (NEW in v0.2.0)
export { AudioManager, SoundOptions, MusicOptions } from './audio/AudioManager';

// Effects (NEW in v0.2.0)
export { Timer, TimerCallback, TimerState, TimerManager } from './effects/Timer';
export { Tween, TweenConfig, TweenState, TweenManager } from './effects/Tween';
export { Easing, EasingFunction, getEasing } from './effects/Easing';

// UI (NEW in v0.2.0)
export { OverlayManager, OverlayConfig, OverlayProps } from './ui/OverlayManager';

// Debug (NEW in v0.2.0)
export { DebugRenderer, DebugSettings } from './debug/DebugRenderer';
export { PerformanceMonitor, PerformanceEntry } from './debug/PerformanceMonitor';

// Utils
export { Time } from './utils/Time';
export { Logger, LogLevel } from './utils/Logger';

// Hooks (NEW - Component-based architecture)
export {
    useGame,
    useGameState,
    useGameLoop,
    useFrameTime,
    useFixedUpdate,
    useAssets,
    useImage,
    useTouch,
    useTap,
    useDrag,
    useSwipe,
    useTimer,
    useDelay,
    useInterval,
    useTween,
    useSpring,
    useTweenSequence,
} from './hooks';

// Components (NEW - React component wrappers)
export {
    Sprite as SpriteComponent,
    SpriteProps,
    SpriteProvider,
    useSpriteRef,
    Collider as ColliderComponent,
    ColliderProps,
    ColliderProvider,
    useCollision,
} from './components';

// Version
export const VERSION = '0.2.0';
