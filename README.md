
# Blaze Engine 🔥

**The Flame for React Native**

<div align="center">

[![npm version](https://img.shields.io/npm/v/blaze-engine?style=flat-square&color=orange)](https://www.npmjs.com/package/blaze-engine)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React_Native-0.71+-cyan?style=flat-square&logo=react)](https://reactnative.dev/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

</div>

Blaze is a universal 2D game engine for **React**, **Next.js**, and **React Native**. 
Powered by **Skia** (Chrome's rendering engine), it delivers 60fps performance on all platforms with a single codebase.

It brings a [Flame](https://flame-engine.org/)-like development experience to the React ecosystem, offering both a robust **ECS** (Entity-Component-System) and a modern **React Hooks** API.

![Blaze Engine Demo](https://raw.githubusercontent.com/blaze-engine/blaze/main/assets/demo.gif)

## � Universal Support Matrix

| Platform | Rendering Engine | Input Support | Audio |
|----------|------------------|---------------|-------|
| **iOS** | JSI / Skia Native | Multi-touch | expo-av |
| **Android** | JSI / Skia Native | Multi-touch | expo-av |
| **Web** (React) | WebAssembly (CanvasKit) | Mouse & Keyboard | Web Audio |
| **Next.js** | WebAssembly (SSR-Safe) | Mouse & Keyboard | Web Audio |

## 🌟 Key Features

*   **Universal Codebase**: Write your game once, run it on mobile and web.
*   **React Hooks API**: `useGame`, `useGameLoop`, `useTouch` for a purely functional approach.
*   **ECS Architecture**: Classic Entity-Component class system for complex logic.
*   **Physics Lite**: Built-in AABB collision detection and spatial partitioning.
*   **Input System**: Normalized touch/mouse input and keyboard support.
*   **Assets**: Unified asset loading for images, spritesheets, and audio.

---

## 📦 Installation

```bash
npm install blaze-engine
```

### Peer Dependencies
You must install these peer dependencies (handled automatically by modern package managers):

```bash
npm install @shopify/react-native-skia react-native-gesture-handler expo-av
```

### Web Setup (Vite / Next.js)
If you are using **Vite**, add this alias to your `vite.config.ts` if needed (usually handled by `react-native-web`):
```ts
resolve: {
  alias: {
    'react-native': 'react-native-web'
  }
}
```

For **Next.js**, ensure you transpile the modules in `next.config.js`:
```js
const nextConfig = {
  transpilePackages: ['blaze-engine', '@shopify/react-native-skia']
};
```

---

## 🚀 Quick Start

### The "React Way" (Hooks)
Perfect for simple games, UI-heavy experiences, and prototyping.

```tsx
import React, { useState } from 'react';
import { BlazeCanvas, useGame, useGameLoop, useTouch, SpriteComponent } from 'blaze-engine';

export default function SimpleGame() {
  // Initialize game - works on Web & Native!
  const { game } = useGame({ width: 360, height: 640 });
  
  // Game State
  const [playerX, setPlayerX] = useState(100);
  const { isTouching, x: touchX } = useTouch();

  // The Game Loop (60fps)
  useGameLoop((dt) => {
    if (isTouching) {
      // Smoothly move player to touch position
      setPlayerX(prev => prev + (touchX - prev) * 5 * dt);
    }
  });

  return (
    <BlazeCanvas game={game}>
      {/* Render Game Objects as Components */}
      <SpriteComponent 
        source={require('./assets/player.png')}
        x={playerX} 
        y={500} 
        width={50} 
        height={50} 
      />
    </BlazeCanvas>
  );
}
```

### The "Engine Way" (ECS)
Ideal for complex games with hundreds of entities, physics, and strict architecture.

```typescript
import { Game, Scene, Entity, Sprite, Collider } from 'blaze-engine';

class Player extends Entity {
  onLoad() {
    this.add(new Sprite({ image: 'player.png' }));
    this.add(Collider.centered(50, 50));
  }
  
  onUpdate(dt: number) {
    if (this.game.keyboard.isKeyDown('Space')) {
      this.position.y -= 100 * dt;
    }
  }
}

class MainScene extends Scene {
  onStart() {
    this.addEntity(new Player());
  }
}

// Start the game
const game = new Game({ width: 360, height: 640 });
game.start(new MainScene());
```

---

## 📚 Documentation

Visit our full documentation site for detailed guides:
👉 **[blaze-engine.com](https://blaze-engine.com)**

### Core Concepts

*   **Game**: The root object. Manages the loop, renderer, and global state.
*   **Scene**: Represents a distinct game state (Menu, Level, GameOver).
*   **Entity**: The base class for all game objects. Can have children.
*   **Component**: Logic or data attached to Entities (e.g., `Sprite`, `Collider`, `Script`).
*   **Systems**: Global managers like `Input`, `Physics`, `Audio`.

## 🤝 Contributing

We welcome contributions! Please check out our [Contributing Guide](CONTRIBUTING.md).

## 📄 License

MIT © [ItzPratapDevs](https://github.com/itzpratapdevs)
