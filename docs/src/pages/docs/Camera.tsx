import { CodeBlock } from '../../components/CodeBlock'

export function CameraDoc() {
  return (
    <>
      <h1>Camera</h1>
      <p>The Camera controls what portion of the game world is visible and provides smooth following, zoom, and shake effects.</p>

      <h2>Accessing the Camera</h2>
      <CodeBlock code={`const { game } = useGame({ width: 360, height: 640 });
const camera = game.camera;`} />

      <h2>Camera Properties</h2>
      <CodeBlock code={`camera.x        // Camera X position
camera.y        // Camera Y position
camera.zoom     // Zoom level (1 = normal)
camera.rotation // Rotation in radians`} />

      <h2>Following a Target</h2>
      <CodeBlock code={`// Follow player with smoothing
camera.follow(player.x, player.y, {
  lerp: 0.1,           // Smoothing (0-1)
  offsetX: 0,          // Offset from target
  offsetY: -100,       // Look ahead
  deadZone: { x: 50, y: 50 } // No movement zone
});

// Or snap immediately
camera.setPosition(player.x, player.y);`} />

      <h2>Camera Bounds</h2>
      <CodeBlock code={`// Limit camera to world bounds
camera.setBounds({
  minX: 0,
  minY: 0,
  maxX: 2000,  // World width
  maxY: 1000   // World height
});

// Remove bounds
camera.clearBounds();`} />

      <h2>Zoom</h2>
      <CodeBlock code={`camera.zoom = 1.5;  // Zoom in
camera.zoom = 0.5;  // Zoom out
camera.zoom = 1;    // Normal

// Zoom to point
camera.zoomTo(2, playerX, playerY);`} />

      <h2>Screen Shake</h2>
      <CodeBlock code={`// Quick shake
camera.shake(10, 0.3); // intensity, duration

// Explosion shake
camera.shake(25, 0.5);

// Check if shaking
if (camera.isShaking) { ... }`} />

      <h2>Coordinate Conversion</h2>
      <CodeBlock code={`// Screen coords → World coords
const worldPos = camera.screenToWorld(touchX, touchY);

// World coords → Screen coords
const screenPos = camera.worldToScreen(enemy.x, enemy.y);`} />

      <h2>Example: Camera Follow</h2>
      <CodeBlock code={`function Game() {
  const { game } = useGame({ width: 360, height: 640 });
  const playerX = useRef(180);
  const playerY = useRef(300);

  useGameLoop((dt) => {
    // Move player
    playerX.current += 50 * dt;
    
    // Camera follows player
    game.camera.follow(playerX.current, playerY.current, {
      lerp: 0.08,
      offsetY: -50
    });
  });

  return <BlazeCanvas game={game} />;
}`} />
    </>
  )
}
