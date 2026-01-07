
# Blaze Engine 🔥

**The Flame for React Native**

Blaze is a high-performance 2D game engine for React Native, powered by **Skia** and **JSI**. It brings a [Flame](https://flame-engine.org/)-like development experience to the React Native ecosystem, supporting both robust **ECS** (Entity-Component-System) and modern **React Hooks** architectures.

![Blaze Engine Demo](https://raw.githubusercontent.com/blaze-engine/blaze/main/assets/demo.gif)

## 🌟 Features

- **Component-Based Architecture**: Build games with React functional components and hooks.
- **Robust ECS**: Traditional class-based entity system for complex state management.
- **High Performance**: JSI-based game loop and Skia rendering pipeline.
- **Physics & Collision**: AABB and Circle collision detection with spatial partitioning.
- **Input System**: Multi-touch, Gestures (Tap, Swipe, Drag, Pinch), and Keyboard support.
- **Animation**: Sprite sheets, frame-based animations, and tweens.
- **Audio**: Sound effects and background music via `expo-av`.
- **Debug Tools**: Visual debuggers for colliders, bounds, grid, and FPS.

## 📦 Installation

```bash
npm install blaze-engine
# Peer dependencies
npm install @shopify/react-native-skia react-native-gesture-handler expo-av
```

## 🚀 Quick Start

### 1. Functional Component API (New!)

Perfect for casual games and React developers:

```tsx
import React, { useState } from 'react';
import { BlazeCanvas, useGame, useGameLoop, useTouch, SpriteComponent } from 'blaze-engine';

export default function SimpleGame() {
  const { game } = useGame({ width: 360, height: 640 });
  const [playerX, setPlayerX] = useState(100);
  const { isTouching, x: touchX } = useTouch();

  useGameLoop((dt) => {
    // Move player towards touch
    if (isTouching) {
      setPlayerX(prev => prev + (touchX - prev) * 5 * dt);
    }
  });

  return (
    <BlazeCanvas game={game}>
      <SpriteComponent 
        x={playerX} 
        y={500} 
        width={50} 
        height={50} 
        tint="#00d9ff" 
      />
    </BlazeCanvas>
  );
}
```

### 2. Class-Based ECS API

Ideal for complex, structured game logic:

```typescript
import { Game, Scene, Entity, Sprite, Collider } from 'blaze-engine';

class Player extends Entity {
  onLoad() {
    this.add(new Sprite({ image: 'player.png' }));
    this.add(Collider.centered(50, 50));
  }
}

class MainScene extends Scene {
  onStart() {
    this.addEntity(new Player());
  }
}

const game = new Game({ width: 360, height: 640 });
game.start(new MainScene());
```

## 🕹️ Examples

Check out the `example/` folder for complete game demos:

- **FlappyBlaze**: A Flappy Bird clone demonstrating gravity, collision, and looping.
- **Breakout**: A brick-breaking game showcasing physics reflection and state management.
- **HooksExample**: A simple interactive demo of the Hooks API.

## 📚 Documentation

### Core Concepts

*   **Game**: The entry point, manages the loop and renderer.
*   **Scene**: Represents a game state (Menu, Level 1).
*   **Entity**: Game objects (Player, Enemy).
*   **Component**: Data/Logic attached to entities (Sprite, Collider).

### Hooks API

*   `useGame()`: Initialize game instance.
*   `useGameLoop(dt)`: Run code every frame.
*   `useAssets()`: Preload images and sounds.
*   `useTouch()` / `useTap()`: Handle input.
*   `useTween()`: Animate values.
