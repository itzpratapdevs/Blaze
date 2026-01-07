import { CodeBlock } from '../../components/CodeBlock'

export function Sprites() {
  return (
    <>
      <h1>Sprites</h1>
      <p>Sprites are visual components for rendering images and shapes in your game.</p>

      <h2>Using SpriteComponent (Hooks API)</h2>
      <CodeBlock code={`import { SpriteComponent, SpriteProvider } from 'blaze-engine';

function Game() {
  const { game } = useGame({ width: 360, height: 640 });

  return (
    <SpriteProvider game={game}>
      <BlazeCanvas game={game}>
        {/* Simple colored rectangle */}
        <SpriteComponent
          x={180}
          y={300}
          width={60}
          height={60}
          color="#f97316"
        />

        {/* With image */}
        <SpriteComponent
          x={180}
          y={400}
          width={64}
          height={64}
          image={playerImage}
        />
      </BlazeCanvas>
    </SpriteProvider>
  );
}`} />

      <h2>Sprite Props</h2>
      <table>
        <thead><tr><th>Prop</th><th>Type</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>x</code></td><td>number</td><td>X position</td></tr>
          <tr><td><code>y</code></td><td>number</td><td>Y position</td></tr>
          <tr><td><code>width</code></td><td>number</td><td>Width in pixels</td></tr>
          <tr><td><code>height</code></td><td>number</td><td>Height in pixels</td></tr>
          <tr><td><code>color</code></td><td>string</td><td>Fill color (hex)</td></tr>
          <tr><td><code>image</code></td><td>SkImage</td><td>Skia image</td></tr>
          <tr><td><code>rotation</code></td><td>number</td><td>Rotation in radians</td></tr>
          <tr><td><code>scale</code></td><td>number</td><td>Scale factor</td></tr>
          <tr><td><code>opacity</code></td><td>number</td><td>0-1 opacity</td></tr>
          <tr><td><code>anchor</code></td><td>SpriteAnchor</td><td>Pivot point</td></tr>
          <tr><td><code>visible</code></td><td>boolean</td><td>Show/hide</td></tr>
        </tbody>
      </table>

      <h2>Sprite Class (ECS API)</h2>
      <CodeBlock code={`import { Sprite } from 'blaze-engine';

class Player extends Entity {
  onStart() {
    this.add(new Sprite({
      x: 100,
      y: 200,
      width: 64,
      height: 64,
      image: AssetLoader.getImage('player'),
      anchor: 'center'
    }));
  }

  onUpdate(dt: number) {
    const sprite = this.get(Sprite);
    sprite.x += 100 * dt;
    sprite.rotation += dt;
  }
}`} />

      <h2>Anchor Points</h2>
      <CodeBlock code={`type SpriteAnchor = 
  | 'topLeft'     // Default
  | 'topCenter'
  | 'topRight'
  | 'centerLeft'
  | 'center'      // Rotation pivot
  | 'centerRight'
  | 'bottomLeft'
  | 'bottomCenter'
  | 'bottomRight';`} />

      <h2>Tinting</h2>
      <CodeBlock code={`const sprite = this.get(Sprite);

// Apply color tint
sprite.setTint('#ff0000');

// Remove tint
sprite.setTint(null);`} />

      <h2>Visibility</h2>
      <CodeBlock code={`sprite.visible = false; // Hide
sprite.visible = true;  // Show

// Or with opacity
sprite.opacity = 0;     // Invisible
sprite.opacity = 0.5;   // Semi-transparent
sprite.opacity = 1;     // Fully visible`} />
    </>
  )
}
