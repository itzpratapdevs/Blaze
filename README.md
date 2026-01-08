# Blaze Engine

<div align="center">
  <img src="https://blaze-engine.pages.dev/logo.webp" alt="Blaze Engine Logo" width="120" />
  <h1>Blaze Engine</h1>
  <p><strong>The Universal 2D Game Engine for React</strong></p>
  
  <p>
    <a href="https://www.npmjs.com/package/blaze-engine"><img src="https://img.shields.io/npm/v/blaze-engine.svg?style=flat-square" alt="NPM Version" /></a>
    <a href="https://www.npmjs.com/package/blaze-engine"><img src="https://img.shields.io/npm/l/blaze-engine.svg?style=flat-square" alt="License" /></a>
    <a href="https://www.npmjs.com/package/blaze-engine"><img src="https://img.shields.io/npm/dm/blaze-engine.svg?style=flat-square" alt="Downloads" /></a>
  </p>
</div>

---

**Blaze Engine** is a high-performance, React-first 2D game engine designed for building cross-platform games using standard React components and hooks. Whether you are building for the web (React.js), desktop (Next.js/Electron), or mobile (React Native), Blaze provides a unified API.

It abstracts away the complexities of the game loop, canvas rendering, and physics, allowing you to focus on building game logic using the React patterns you already know.

## Features

- **React-First Architecture**: Build games using functional components and hooks (`useGameLoop`, `useCollision`, `useInput`).
- **Universal Compatibility**: Works seamlessly on Web, iOS, and Android.
- **Camera System**: Built-in camera with smooth follow, zoom, rotation, and screen shake.
- **Tilemaps**: Easy support for grid-based levels and worlds using standard data structures.
- **Particle System**: Create advanced visual effects like fire, smoke, and explosions with high performance.
- **Input Handling**: Unified API for Keyboard, Mouse, and Touch controls (including virtual Joystick).
- **Audio Management**: Simple hook-based audio manager (`useAudio`) for sound effects and music.
- **Physics Engine**: Lightweight 2D physics engine (`Rigidbody`) for gravity, velocity, and collisions.

## Installation

To install Blaze Engine, run the following command in your project directory:

```bash
npm install blaze-engine
# or
yarn add blaze-engine
```

## Quick Start

Here is a simple example of a player moving with keyboard controls. Notice how game logic is handled inside a standard React functional component.

```tsx
import React, { useState } from 'react';
import { BlazeGame, Sprite, useGameLoop, useInput } from 'blaze-engine';

function Player() {
  const [x, setX] = useState(100);
  const [y, setY] = useState(100);
  const input = useInput();
  const SPEED = 200; // pixels per second

  // The game loop runs at 60fps (or native refresh rate)
  useGameLoop((dt) => {
    if (input.isKeyDown('ArrowRight')) {
      setX((prev) => prev + SPEED * dt);
    }
    if (input.isKeyDown('ArrowLeft')) {
      setX((prev) => prev - SPEED * dt);
    }
  });

  return <Sprite src="/player.png" x={x} y={y} />;
}

export default function Game() {
  return (
    <BlazeGame width={800} height={600}>
      <Player />
    </BlazeGame>
  );
}
```

## Documentation

For full documentation, including detailed API references, guides, and examples, please visit our official documentation site:

[**Read the Documentation**](https://blaze-engine.pages.dev)

## Contributing

We welcome contributions from the community. Please feel free to suggest features or report bugs via NPM or our community channels.

## License

MIT © 2026.
