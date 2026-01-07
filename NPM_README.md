# Blaze Engine

**The Flame for React Native** 🔥

Blaze is a high-performance 2D game engine for React Native, powered by Skia and JSI. It brings a Flame-like development experience to the React Native ecosystem, offering both a robust ECS (Entity-Component-System) for complex games and a modern Hooks-based API for simpler experiences.

![Blaze Logo](https://raw.githubusercontent.com/blaze-engine/blaze/main/assets/blaze-logo.png)

## Features

- 🚀 **High Performance**: Built on `react-native-skia` with JSI/C++ internals.
- ⚛️ **React First**: Use `useGame`, `useGameLoop`, and functional components.
- 🎮 **Game Ready**: Sprite animation, collision, physics, audio, and input systems.
- 📱 **Cross Platform**: Works on iOS, Android, and Web (via Skia Web).
- 🧩 **Modular**: Use only what you need - Core, Physics, Input, or Render.

## Installation

```bash
npm install blaze-engine @shopify/react-native-skia react-native-gesture-handler expo-av
```

## Quick Start (Hooks API)

Create a simple game in minutes using React components:

```tsx
import React, { useState } from 'react';
import { BlazeCanvas, useGame, useGameLoop, useTouch, SpriteComponent } from 'blaze-engine';

export default function Game() {
  const { game } = useGame({ width: 360, height: 640 });
  const [x, setX] = useState(100);
  const { isTouching, x: touchX } = useTouch();

  useGameLoop((dt) => {
    if (isTouching) {
      setX(prev => prev + (touchX - prev) * 5 * dt);
    }
  });

  return (
    <BlazeCanvas game={game}>
      <SpriteComponent 
        x={x} 
        y={300} 
        width={50} 
        height={50} 
        tint="#ff9900" 
      />
    </BlazeCanvas>
  );
}
```

## Quick Start (Class API)

For complex games, use the robust ECS architecture:

```typescript
class Player extends Entity {
  onLoad() {
    this.add(new Sprite({ image: 'player.png' }));
    this.add(new CircleCollider({ radius: 20 }));
  }
  
  onUpdate(dt: number) {
    if (Input.isKeyDown('ArrowRight')) {
      this.get(Sprite).x += 100 * dt;
    }
  }
}

class MainScene extends Scene {
  onStart() {
    this.addEntity(new Player());
  }
}
```

## Documentation

Full documentation is available at [blaze-engine.com](https://blaze-engine.com).

## License

MIT
