# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-08

### ⚠️ BREAKING CHANGES

This is a complete rewrite of Blaze Engine with a new React-first architecture.

- **Removed native folders** - No more `android/` or `ios/` directories
- **Removed `blaze.podspec`** - No iOS native code
- **Converted from class-based to functional** - All APIs are now hooks and components
- **Removed class exports** - `Game`, `Scene`, `Entity`, `Component`, `System` classes removed
- **Simplified dependencies** - Only requires `react` as peer dependency

### Added

#### Core Components
- `<BlazeGame>` - Root game container with built-in game loop, canvas, and context
- `useGame()` - Hook to access game state (width, height, fps, deltaTime, etc.)

#### Sprite Components
- `<Sprite>` - Enhanced sprite component with ref support, transforms, and update callbacks
- `<AnimatedSprite>` - Sprite sheet animation with play/pause/stop controls

#### Shape Components
- `<Rectangle>` - Rectangle with optional rounded corners
- `<Circle>` - Circle shape
- `<Line>` - Line segment
- `<Polygon>` - Custom polygon shapes
- `<Text>` - Text rendering on canvas

#### Effects Components
- `<ParticleSystem>` - Full particle emitter with physics, colors, sizes, and gravity
- `<Parallax>` + `<ParallaxLayer>` - Multi-layer parallax backgrounds
- `<TiledBackground>` - Seamless tiled scrolling backgrounds

#### Camera System 🆕
- `<Camera>` - Viewport control with follow, bounds, zoom, rotation
- `useCamera()` - Hook to control camera programmatically
- `<ScreenShake>` - Screen shake effect component
- Smooth follow with lerp
- World coordinate to screen coordinate conversion

#### UI Components 🆕
- `<Joystick>` - Virtual joystick for mobile touch controls
- `<Button>` - Game button with press/release callbacks
- `<ProgressBar>` - Health/progress bars with gradients and animation
- `<NineSlice>` - Nine-slice sprite for resizable UI panels

#### World & Physics 🆕
- `<Tilemap>` - Grid-based tilemap rendering
- `useTilemap()` - Tilemap manipulation (get/set tiles, collision helpers)
- `<SceneManager>` + `<Scene>` - Multi-scene game support
- `useSceneManager()` - Scene navigation
- `<Rigidbody>` - Simple 2D physics (gravity, velocity, forces)
- `useRigidbody()` - Access rigidbody state

#### Core Hooks
- `useGameLoop(callback)` - Register frame update callback
- `useFixedUpdate(callback)` - Fixed timestep updates (60Hz) for physics
- `useInput()` - Unified input for mouse, touch, and keyboard
- `useTimer(duration, options)` - Timer with start/stop/reset
- `useInterval(callback, ms)` - Repeated callback
- `useDelay(callback, ms)` - One-time delayed callback

#### Animation Hooks
- `useTween(config)` - Tween animations with easing
- `useSpring(config)` - Spring physics animations
- `useAnimatedValue(initial, speed)` - Smooth value transitions
- `Easing` - Collection of easing functions (quad, cubic, elastic, bounce, back)

#### Collision Hooks
- `useCollision(bounds, options)` - Register entity for collision detection
- `<CollisionSystem>` - Component that runs collision checks
- `boundsOverlap()`, `circleCollision()`, `pointInBounds()` - Utility functions

#### Asset Hooks
- `useAssets(manifest)` - Preload images and audio with progress
- `useImage(src)` - Load single image
- `useAudio(src, options)` - Load and control audio playback

#### Math Utilities
- `Vector2` - Functional 2D vector operations
- `Rectangle` - Rectangle utilities
- `clamp()`, `lerp()`, `map()` - Common math functions
- `randomInt()`, `randomFloat()`, `randomElement()` - Random utilities
- `degToRad()`, `radToDeg()` - Angle conversions

### Examples
- 🚀 **Space Shooter** - Sprites, particles, collision, spawning, screen shake
- 🎮 **Platformer** - Tilemap, camera follow, physics, coin collection
- 🏃 **Endless Runner** - Procedural generation, mobile joystick, scoring

### Removed

- `android/` - Native Android code
- `ios/` - Native iOS code
- `blaze.podspec` - iOS CocoaPods spec
- Class-based API (`Game`, `Scene`, `Entity`, `Component`, `System`)
- `@shopify/react-native-skia` dependency (now optional)
- `react-native` as required dependency (now optional)
- `react-native-gesture-handler` dependency

### Changed

- Architecture is now 100% React components and hooks
- Any React library can be used inside games
- Canvas-based rendering (works in browser and React Native with canvas support)
- Simplified package - pure TypeScript, no native code

### Migration Guide

#### Before (v0.x)
```tsx
import { Game, Scene, Sprite, BlazeCanvas } from 'blaze-engine';

class MyScene extends Scene {
  onUpdate(dt) {
    this.player.x += 100 * dt;
  }
}

const game = new Game({ width: 800, height: 600 });
game.setScene(new MyScene());

function App() {
  return <BlazeCanvas game={game} />;
}
```

#### After (v1.0.0)
```tsx
import { BlazeGame, Sprite, useGameLoop } from 'blaze-engine';

function Player() {
  const [x, setX] = useState(0);
  
  useGameLoop((dt) => {
    setX(x => x + 100 * dt);
  });
  
  return <Sprite src="/player.png" x={x} y={100} />;
}

function App() {
  return (
    <BlazeGame width={800} height={600}>
      <Player />
    </BlazeGame>
  );
}
```

---

## [0.3.0] - 2026-01-07

### Added
- Hooks API (useGame, useGameLoop, useTouch, useAssets)
- React component wrappers for Sprite and Collider

### Fixed
- Various bug fixes and performance improvements

---

## [0.2.0] - 2026-01-06

### Added
- SpriteSheet and SpriteAnimation
- AnimatedSprite
- Audio support
- Timer and Tween effects
- Debug renderer
- Performance monitor

---

## [0.1.0] - 2026-01-05

### Added
- Initial release
- Game, Scene, Entity core classes
- Sprite rendering
- Touch and keyboard input
- AABB collision detection
- Basic camera system
