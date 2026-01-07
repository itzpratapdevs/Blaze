import { CodeBlock } from '../../../components/CodeBlock'

export function UseTouchHook() {
  return (
    <>
      <h1>useTouch</h1>
      <p>Handle touch input in your game.</p>

      <h2>Import</h2>
      <CodeBlock code={`import { useTouch, useTap, useDrag, useSwipe } from 'blaze-engine';`} />

      <h2>useTouch</h2>
      <p>Get current touch state:</p>
      <CodeBlock code={`function MyGame() {
  const { game } = useGame({ width: 360, height: 640 });
  const touch = useTouch(game);

  useGameLoop((dt) => {
    if (touch.isPressed) {
      console.log('Touch at:', touch.x, touch.y);
    }
  });
}`} />

      <h3>Touch State</h3>
      <CodeBlock code={`{
  isPressed: boolean,   // Is finger currently down?
  x: number,            // Current X position (game coords)
  y: number,            // Current Y position (game coords)
  startX: number,       // Start X of current touch
  startY: number,       // Start Y of current touch
  deltaX: number,       // Movement since last frame
  deltaY: number        // Movement since last frame
}`} />

      <h2>useTap</h2>
      <p>Detect tap gestures:</p>
      <CodeBlock code={`useTap(game, (x, y) => {
  console.log('Tapped at:', x, y);
  // Spawn projectile, jump, etc.
});`} />

      <h2>useDrag</h2>
      <p>Handle drag gestures:</p>
      <CodeBlock code={`useDrag(game, {
  onStart: (x, y) => {
    console.log('Drag started at:', x, y);
  },
  onMove: (x, y, dx, dy) => {
    // dx, dy = movement delta
    playerX.current += dx;
  },
  onEnd: (x, y) => {
    console.log('Drag ended at:', x, y);
  }
});`} />

      <h2>useSwipe</h2>
      <p>Detect swipe gestures:</p>
      <CodeBlock code={`import { SwipeDirection } from 'blaze-engine';

useSwipe(game, (direction, velocity) => {
  switch (direction) {
    case SwipeDirection.Left:
      moveLeft();
      break;
    case SwipeDirection.Right:
      moveRight();
      break;
    case SwipeDirection.Up:
      jump();
      break;
    case SwipeDirection.Down:
      duck();
      break;
  }
});`} />

      <h2>Example: Drag Player</h2>
      <CodeBlock code={`function DraggablePlayer() {
  const { game } = useGame({ width: 360, height: 640 });
  const playerX = useRef(180);
  const playerY = useRef(300);

  useDrag(game, {
    onMove: (x, y, dx, dy) => {
      playerX.current += dx;
      playerY.current += dy;
    }
  });

  return (
    <BlazeCanvas game={game}>
      <SpriteComponent 
        x={playerX.current} 
        y={playerY.current}
        width={60} height={60} 
        color="#f97316" 
      />
    </BlazeCanvas>
  );
}`} />
    </>
  )
}
