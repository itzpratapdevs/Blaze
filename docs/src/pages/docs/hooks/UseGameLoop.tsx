import { CodeBlock } from '../../../components/CodeBlock'

export function UseGameLoopHook() {
  return (
    <>
      <h1>useGameLoop</h1>
      <p>Run code every frame at 60fps.</p>

      <h2>Import</h2>
      <CodeBlock code={`import { useGameLoop } from 'blaze-engine';`} />

      <h2>Basic Usage</h2>
      <CodeBlock code={`function MyGame() {
  const { game } = useGame({ width: 360, height: 640 });
  const playerY = useRef(300);

  useGameLoop((dt) => {
    // dt = delta time in seconds (usually ~0.016 at 60fps)
    playerY.current -= 100 * dt; // Move 100 pixels per second
  });

  return <BlazeCanvas game={game} />;
}`} />

      <h2>Parameters</h2>
      <table>
        <thead>
          <tr><th>Param</th><th>Type</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><code>callback</code></td>
            <td>(dt: number) =&gt; void</td>
            <td>Function called every frame. dt is delta time in seconds.</td>
          </tr>
        </tbody>
      </table>

      <h2>Delta Time</h2>
      <p>Always multiply movements by <code>dt</code> for frame-rate independent motion:</p>
      <CodeBlock code={`// ❌ Wrong - speed depends on frame rate
x += 5;

// ✅ Correct - consistent 300 pixels per second
x += 300 * dt;`} />

      <h2>useFrameTime</h2>
      <p>Get the current delta time as a reactive value:</p>
      <CodeBlock code={`import { useFrameTime } from 'blaze-engine';

function DebugUI() {
  const dt = useFrameTime();
  const fps = Math.round(1 / dt);
  
  return <Text>FPS: {fps}</Text>;
}`} />

      <h2>useFixedUpdate</h2>
      <p>For physics, use fixed timestep updates:</p>
      <CodeBlock code={`import { useFixedUpdate } from 'blaze-engine';

function Physics() {
  useFixedUpdate((fixedDt) => {
    // Runs at fixed 60Hz regardless of render rate
    // fixedDt is always 1/60 = 0.01667
    velocity.current += gravity * fixedDt;
    position.current += velocity.current * fixedDt;
  });
}`} />

      <h2>Example: Bouncing Ball</h2>
      <CodeBlock code={`function BouncingBall() {
  const { game } = useGame({ width: 360, height: 640 });
  const y = useRef(100);
  const velocity = useRef(0);
  const gravity = 500;

  useGameLoop((dt) => {
    velocity.current += gravity * dt;
    y.current += velocity.current * dt;

    // Bounce off bottom
    if (y.current > 600) {
      y.current = 600;
      velocity.current = -velocity.current * 0.8;
    }
  });

  return (
    <BlazeCanvas game={game}>
      <SpriteComponent x={180} y={y.current} width={40} height={40} color="#f00" />
    </BlazeCanvas>
  );
}`} />
    </>
  )
}
