import { CodeBlock } from '../../components/CodeBlock';

export default function CameraPage() {
  return (
    <article className="docs-content">
      <h1>Camera</h1>
      <p className="lead">
        Control the viewport with smooth follow, zoom, bounds, and screen shake effects.
      </p>

      <h2>Basic Usage</h2>
      <CodeBlock code={`import { BlazeGame, Camera, Sprite } from 'blaze-engine';

function Game() {
    return (
        <BlazeGame width={800} height={600}>
            <Camera followSpeed={0.1}>
                <Player />
                <Level />
            </Camera>
        </BlazeGame>
    );
}`} />

      <h2>Following a Target</h2>
      <p>Use the <code>useCamera</code> hook to make the camera follow the player:</p>
      <CodeBlock code={`function Player() {
    const [x, setX] = useState(100);
    const [y, setY] = useState(100);
    const camera = useCamera();
    
    useGameLoop((dt) => {
        // Move player...
        setX(x => x + dx);
        
        // Update camera to follow
        camera.follow(x, y, 0.1);
    });
    
    return <Sprite src="/player.png" x={x} y={y} />;
}`} />

      <h2>Camera Bounds</h2>
      <p>Constrain the camera to world boundaries:</p>
      <CodeBlock code={`<Camera 
    bounds={{ 
        x: 0, 
        y: 0, 
        width: 2000,   // World width
        height: 1000   // World height
    }}
>
    {/* Game content */}
</Camera>`} />

      <h2>Screen Shake</h2>
      <p>Add impact effects with screen shake:</p>
      <CodeBlock code={`function Explosion({ x, y }) {
    const camera = useCamera();
    
    useEffect(() => {
        // Shake: intensity 10px, duration 0.3s
        camera.shake(10, 0.3);
    }, []);
    
    return <ParticleSystem x={x} y={y} />;
}

// Or use the component:
<ScreenShake 
    trigger={explosionOccurred} 
    intensity={15} 
    duration={0.5} 
/>`} />

      <h2>Zoom</h2>
      <CodeBlock code={`const camera = useCamera();

// Zoom in
camera.setZoom(2);

// Zoom out
camera.setZoom(0.5);`} />

      <h2>Coordinate Conversion</h2>
      <p>Convert between world and screen coordinates:</p>
      <CodeBlock code={`const camera = useCamera();

// World position to screen position
const screenPos = camera.worldToScreen(worldX, worldY);

// Screen position (e.g., mouse) to world position
const worldPos = camera.screenToWorld(input.position.x, input.position.y);`} />

      <h2>Props Reference</h2>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>x</td><td>number</td><td>0</td><td>Initial X position</td></tr>
          <tr><td>y</td><td>number</td><td>0</td><td>Initial Y position</td></tr>
          <tr><td>zoom</td><td>number</td><td>1</td><td>Zoom level (1 = 100%)</td></tr>
          <tr><td>rotation</td><td>number</td><td>0</td><td>Rotation in radians</td></tr>
          <tr><td>bounds</td><td>object</td><td>-</td><td>World bounds constraint</td></tr>
          <tr><td>followSpeed</td><td>number</td><td>0.1</td><td>Smooth follow speed (0-1)</td></tr>
        </tbody>
      </table>
    </article>
  );
}
