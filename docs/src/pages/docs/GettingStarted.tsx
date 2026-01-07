import { CodeBlock } from '../../components/CodeBlock'

export function GettingStarted() {
  return (
    <>
      <h1>Introduction</h1>
      <p>
        <strong>blaze-engine</strong> is the universal game engine for React.
        Build high-performance 2D games that run on React.js, Next.js, iOS, and Android
        using a single codebase.
      </p>

      <h2>Universal Support</h2>
      <p>Blaze bridges the gap between web and native game development:</p>
      <ul>
        <li><strong>Web (React/Next.js)</strong> — Runs on Canvas with WebAssembly acceleration.</li>
        <li><strong>Mobile (React Native)</strong> — Runs on Skia Native with JSI for 60fps performance.</li>
      </ul>

      <h2>Features</h2>
      <ul>
        <li><strong>Write Once</strong> — Same game code runs on all platforms</li>
        <li><strong>React Hooks API</strong> — Declarative game logic (useGame, useGameLoop)</li>
        <li><strong>ECS Architecture</strong> — Scalable Entity-Component-System</li>
        <li><strong>Physics</strong> — Built-in collision detection and specialized loops</li>
        <li><strong>Animation</strong> — Sprite sheets, particles, and tweens</li>
      </ul>

      <h2>Quick Code Example</h2>
      <CodeBlock code={`import { BlazeCanvas, useGame, useGameLoop } from 'blaze-engine';

function Game() {
  // This component works in Next.js AND React Native!
  const { game } = useGame({ width: 360, height: 640 });
  
  useGameLoop((dt) => {
    // Logic runs on every frame
    // Web: requestAnimationFrame
    // Native: Native Choreographer/DisplayLink
    player.x += speed * dt;
  });

  return <BlazeCanvas game={game} />;
}`} />

      <h2>Why Blaze?</h2>
      <p>
        Most game engines force you to choose between Web (Phaser, Pixi) or Native (Unity, Godot).
        Blaze lets you stay in the <strong>React ecosystem</strong> and deploy everywhere.
      </p>

      <h2>Next Steps</h2>
      <p>
        → <a href="/docs/installation">Installation</a> — Set up for Web or Native<br />
        → <a href="/docs/quickstart">Quick Start</a> — Build your first universal game
      </p>
    </>
  )
}
