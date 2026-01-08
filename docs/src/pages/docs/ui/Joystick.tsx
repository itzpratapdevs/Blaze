import { CodeBlock } from '../../../components/CodeBlock';

export default function JoystickPage() {
    return (
        <article className="docs-content">
            <h1>Joystick</h1>
            <p className="lead">
                Virtual joystick for touch/mouse controls on mobile games.
            </p>

            <h2>Basic Usage</h2>
            <CodeBlock code={`import { BlazeGame, Joystick, Sprite } from 'blaze-engine';

function Game() {
    const [playerX, setPlayerX] = useState(200);
    const [playerY, setPlayerY] = useState(200);
    
    return (
        <BlazeGame width={400} height={600}>
            <Sprite src="/player.png" x={playerX} y={playerY} />
            
            <Joystick
                x={80}
                y={520}
                size={120}
                onMove={({ x, y, force }) => {
                    // x, y are -1 to 1
                    setPlayerX(prev => prev + x * 200 * 0.016);
                    setPlayerY(prev => prev + y * 200 * 0.016);
                }}
            />
        </BlazeGame>
    );
}`} />

            <h2>Movement Data</h2>
            <CodeBlock code={`<Joystick
    x={80} y={500}
    onMove={({ x, y, angle, force }) => {
        // x: -1 (left) to 1 (right)
        // y: -1 (up) to 1 (down)
        // angle: direction in radians
        // force: 0 to 1 (how far stick is pushed)
        
        // Example: 8-directional movement
        if (force > 0.3) {
            player.velocityX = x * speed;
            player.velocityY = y * speed;
            player.rotation = angle;
        } else {
            player.velocityX = 0;
            player.velocityY = 0;
        }
    }}
/>`} />

            <h2>Customization</h2>
            <CodeBlock code={`<Joystick
    x={80}
    y={520}
    size={140}
    baseColor="rgba(255, 255, 255, 0.2)"
    stickColor="rgba(100, 200, 255, 0.8)"
    deadZone={0.15}
    opacity={0.8}
    onMove={handleMove}
    onRelease={() => {
        // Stop player when released
        setVelocity({ x: 0, y: 0 });
    }}
/>`} />

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
                    <tr><td>x, y</td><td>number</td><td>-</td><td>Position (center)</td></tr>
                    <tr><td>size</td><td>number</td><td>100</td><td>Joystick diameter</td></tr>
                    <tr><td>baseColor</td><td>string</td><td>rgba(255,255,255,0.3)</td><td>Base circle color</td></tr>
                    <tr><td>stickColor</td><td>string</td><td>rgba(255,255,255,0.6)</td><td>Stick color</td></tr>
                    <tr><td>deadZone</td><td>number</td><td>0.1</td><td>Dead zone (0-1)</td></tr>
                    <tr><td>opacity</td><td>number</td><td>1</td><td>Overall opacity</td></tr>
                    <tr><td>onMove</td><td>function</td><td>-</td><td>Called on movement</td></tr>
                    <tr><td>onRelease</td><td>function</td><td>-</td><td>Called when released</td></tr>
                </tbody>
            </table>
        </article>
    );
}
