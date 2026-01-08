// ============================================
// BLAZE ENGINE v1.0.0
// The simplest 2D game engine for React
// ============================================

/**
 * @packageDocumentation
 * @module blaze-engine
 *
 * Blaze is a React-first 2D game engine. Build games using
 * familiar React patterns - components, hooks, and state.
 * 
 * Features: Sprites, Particles, Tilemaps, Physics, Camera, UI, Audio, and more!
 * Any React library works inside your games!
 *
 * @example
 * ```tsx
 * import { BlazeGame, Sprite, useGameLoop, useInput } from 'blaze-engine';
 *
 * function Player() {
 *   const [x, setX] = useState(100);
 *   const input = useInput();
 *   
 *   useGameLoop((dt) => {
 *     if (input.isKeyDown('ArrowRight')) setX(x => x + 200 * dt);
 *     if (input.isKeyDown('ArrowLeft')) setX(x => x - 200 * dt);
 *   });
 *   
 *   return <Sprite src="/player.png" x={x} y={300} />;
 * }
 *
 * function App() {
 *   return (
 *     <BlazeGame width={800} height={600}>
 *       <Player />
 *     </BlazeGame>
 *   );
 * }
 * ```
 */

// ============================================
// CORE COMPONENTS
// ============================================

export {
    BlazeGame,
    useGame,
    type BlazeGameProps,
    type GameConfig,
    type GameState,
    type GameContextValue,
} from './components/BlazeGame';

// ============================================
// SPRITE COMPONENTS
// ============================================

export {
    Sprite,
    AnimatedSprite,
    type SpriteProps,
    type SpriteRef,
    type AnimatedSpriteProps,
    type AnimatedSpriteRef,
} from './components/Sprite';

// ============================================
// SHAPE COMPONENTS
// ============================================

export {
    Rectangle,
    Circle,
    Line,
    Polygon,
    Text,
    type RectangleProps,
    type CircleProps,
    type LineProps,
    type PolygonProps,
    type TextProps,
} from './components/Shapes';

// ============================================
// EFFECTS COMPONENTS
// ============================================

export {
    ParticleSystem,
    Parallax,
    ParallaxLayer,
    TiledBackground,
    type ParticleSystemProps,
    type ParallaxProps,
    type ParallaxLayerProps,
    type TiledBackgroundProps,
} from './components/Effects';

// ============================================
// CAMERA
// ============================================

export {
    Camera,
    useCamera,
    ScreenShake,
    type CameraProps,
    type CameraState,
    type CameraContextValue,
    type ScreenShakeProps,
} from './components/Camera';

// ============================================
// UI COMPONENTS
// ============================================

export {
    Joystick,
    Button,
    ProgressBar,
    NineSlice,
    type JoystickProps,
    type ButtonProps,
    type ProgressBarProps,
    type NineSliceProps,
} from './components/UI';

// ============================================
// WORLD COMPONENTS (Tilemap, Physics, Scene)
// ============================================

export {
    Tilemap,
    useTilemap,
    SceneManager,
    Scene,
    useSceneManager,
    Rigidbody,
    useRigidbody,
    type TilemapProps,
    type TilemapRef,
    type SceneManagerProps,
    type SceneProps,
    type RigidbodyProps,
    type RigidbodyState,
} from './components/World';

// ============================================
// CORE HOOKS
// ============================================

export {
    useInput,
    useGameLoop,
    useFixedUpdate,
    useTimer,
    useInterval,
    useDelay,
    type InputState,
    type Timer,
} from './hooks/core';

// ============================================
// ANIMATION HOOKS
// ============================================

export {
    useTween,
    useSpring,
    useAnimatedValue,
    Easing,
    type TweenConfig,
    type TweenControls,
    type SpringConfig,
    type SpringControls,
    type EasingFunction,
} from './hooks/animation';

// ============================================
// COLLISION HOOKS & UTILS
// ============================================

export {
    useCollision,
    CollisionSystem,
    pointInBounds,
    boundsOverlap,
    circleCollision,
    pointInCircle,
    type Bounds,
    type CollisionInfo,
    type UseCollisionOptions,
} from './hooks/collision';

// ============================================
// ASSET HOOKS
// ============================================

export {
    useAssets,
    useImage,
    useAudio,
    type AssetManifest,
    type AssetsState,
    type AudioControls,
} from './hooks/assets';

// ============================================
// MATH UTILITIES
// ============================================

export {
    Vector2,
    Rectangle as Rect,
    clamp,
    lerp,
    inverseLerp,
    map,
    degToRad,
    radToDeg,
    randomInt,
    randomFloat,
    randomElement,
    shuffle,
    wrap,
    smoothstep,
    approxEqual,
    type Vec2,
    type Rect as RectType,
} from './math';

// ============================================
// VERSION
// ============================================

export const VERSION = '1.0.0';
