import { CodeBlock } from '../../components/CodeBlock'

export function QuickStart() {
  return (
    <>
      <h1>Quick Start</h1>
      <p>Build a simple game in 5 minutes using the Hooks API.</p>

      <h2>1. Create the Game Component</h2>
      <CodeBlock code={`import { BlazeCanvas, useGame, useGameLoop } from 'blaze-engine';
import { useState } from 'react';

function MyGame() {
  const { game } = useGame({ 
    width: 360, 
    height: 640,
    backgroundColor: '#1a1a2e'
  });

  const [score, setScore] = useState(0);

  useGameLoop((dt) => {
    // Game logic runs 60 times per second
    // dt = time since last frame in seconds
  });

  return <BlazeCanvas game={game} style={{ flex: 1 }} />;
}`} />

      <h2>2. Add a Player Sprite</h2>
      <CodeBlock code={`import { 
  BlazeCanvas, useGame, useGameLoop, 
  SpriteProvider, SpriteComponent 
} from 'blaze-engine';
import { useState, useRef } from 'react';

function MyGame() {
  const { game } = useGame({ width: 360, height: 640 });
  const playerX = useRef(180);
  const playerY = useRef(500);

  useGameLoop((dt) => {
    // Move player up
    playerY.current -= 100 * dt;
  });

  return (
    <SpriteProvider game={game}>
      <BlazeCanvas game={game}>
        <SpriteComponent
          x={playerX.current}
          y={playerY.current}
          width={50}
          height={50}
          color="#f97316"
        />
      </BlazeCanvas>
    </SpriteProvider>
  );
}`} />

      <h2>3. Handle Touch Input</h2>
      <CodeBlock code={`import { useTouch, useTap } from 'blaze-engine';

function MyGame() {
  const { game } = useGame({ width: 360, height: 640 });
  const playerX = useRef(180);

  // Get current touch state
  const touch = useTouch(game);

  // Handle taps
  useTap(game, (x, y) => {
    console.log('Tapped at:', x, y);
    playerX.current = x;
  });

  useGameLoop((dt) => {
    // Move towards touch position
    if (touch.isPressed) {
      playerX.current += (touch.x - playerX.current) * 5 * dt;
    }
  });

  // ...
}`} />

      <h2>4. Add Collision Detection</h2>
      <CodeBlock code={`import { 
  ColliderProvider, ColliderComponent, useCollision 
} from 'blaze-engine';

function MyGame() {
  const { game } = useGame({ width: 360, height: 640 });

  // Detect collisions
  useCollision(game, 'player', 'enemy', (player, enemy) => {
    console.log('Player hit enemy!');
  });

  return (
    <ColliderProvider game={game}>
      <BlazeCanvas game={game}>
        {/* Player with collider */}
        <ColliderComponent
          id="player"
          layer="player"
          x={180} y={500}
          width={50} height={50}
        />
        
        {/* Enemy with collider */}
        <ColliderComponent
          id="enemy"
          layer="enemy"
          x={180} y={100}
          width={50} height={50}
        />
      </BlazeCanvas>
    </ColliderProvider>
  );
}`} />

      <h2>Complete Example</h2>
      <CodeBlock code={`import { 
  BlazeCanvas, useGame, useGameLoop, useTouch,
  SpriteProvider, SpriteComponent 
} from 'blaze-engine';
import { useRef, useState } from 'react';

export default function Game() {
  const { game } = useGame({ 
    width: 360, 
    height: 640,
    backgroundColor: '#0f172a'
  });
  
  const touch = useTouch(game);
  const playerX = useRef(180);
  const [score, setScore] = useState(0);

  useGameLoop((dt) => {
    if (touch.isPressed) {
      playerX.current += (touch.x - playerX.current) * 8 * dt;
    }
  });

  return (
    <SpriteProvider game={game}>
      <BlazeCanvas game={game} style={{ flex: 1 }}>
        <SpriteComponent
          x={playerX.current}
          y={550}
          width={60}
          height={60}
          color="#f97316"
        />
      </BlazeCanvas>
    </SpriteProvider>
  );
}`} />

      <h2>Next Steps</h2>
      <p>
        → <a href="/docs/hooks/use-game">useGame Hook</a><br />
        → <a href="/docs/hooks/use-game-loop">useGameLoop Hook</a><br />
        → <a href="/docs/sprites">Sprites</a>
      </p>
    </>
  )
}
