import { CodeBlock } from '../../components/CodeBlock'

export function GameLoop() {
    return (
        <>
            <h1>Game Loop</h1>
            <p>The game loop is the heart of any game engine. Blaze uses a fixed-timestep loop with JSI for native performance.</p>

            <h2>How It Works</h2>
            <pre className="text-xs bg-neutral-900 p-4 rounded-xl overflow-x-auto text-neutral-400">{`┌─────────────────┐
│   Start Game    │
└────────┬────────┘
         ▼
┌─────────────────┐
│  Request Frame  │◄────────┐
└────────┬────────┘         │
         ▼                  │
┌─────────────────┐         │
│  Calculate dt   │         │
└────────┬────────┘         │
         ▼                  │
┌─────────────────┐         │
│  Update Logic   │         │
└────────┬────────┘         │
         ▼                  │
┌─────────────────┐         │
│     Render      │         │
└────────┬────────┘         │
         └──────────────────┘`}</pre>

            <h2>Using the Game Loop</h2>
            <h3>With Hooks (Recommended)</h3>
            <CodeBlock code={`import { useGameLoop } from 'blaze-engine';

useGameLoop((dt) => {
  // dt = time since last frame in seconds
  // At 60fps, dt ≈ 0.0167
  player.x += speed * dt;
});`} />

            <h3>With ECS</h3>
            <CodeBlock code={`class MyScene extends Scene {
  onUpdate(dt: number) {
    // Called every frame
    this.player.x += this.speed * dt;
  }
}`} />

            <h2>Fixed Timestep</h2>
            <p>For physics, use fixed timestep to ensure consistent behavior:</p>
            <CodeBlock code={`import { useFixedUpdate } from 'blaze-engine';

useFixedUpdate((fixedDt) => {
  // Always 1/60 second, regardless of frame rate
  velocity += gravity * fixedDt;
  position += velocity * fixedDt;
});`} />

            <h2>GameLoop Class</h2>
            <CodeBlock code={`import { GameLoop, globalGameLoop } from 'blaze-engine';

// Access global loop
globalGameLoop.isRunning;
globalGameLoop.targetFPS;

// Or create custom
const loop = new GameLoop({
  targetFPS: 60,
  onFrame: (dt) => { ... }
});
loop.start();
loop.stop();`} />
        </>
    )
}
