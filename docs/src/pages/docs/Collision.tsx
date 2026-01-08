import { CodeBlock } from '../../components/CodeBlock';

export default function CollisionPage() {
    return (
        <article className="docs-content">
            <h1>Collision Detection</h1>
            <p className="lead">
                Detect collisions between game objects with useCollision hook.
            </p>

            <h2>Setup</h2>
            <p>Add <code>CollisionSystem</code> to your game:</p>
            <CodeBlock code={`import { BlazeGame, CollisionSystem } from 'blaze-engine';

function Game() {
    return (
        <BlazeGame width={800} height={600}>
            <CollisionSystem />  {/* Required for collision detection */}
            <Player />
            <Enemies />
            <Coins />
        </BlazeGame>
    );
}`} />

            <h2>Basic Collision</h2>
            <CodeBlock code={`function Player() {
    const [x, setX] = useState(100);
    const [y, setY] = useState(100);
    
    // Register collision bounds
    useCollision(
        { left: x, top: y, right: x + 32, bottom: y + 32 },
        {
            tag: 'player',
            onCollision: (info) => {
                if (info.other.tag === 'enemy') {
                    takeDamage();
                }
                if (info.other.tag === 'coin') {
                    collectCoin(info.other.data.id);
                }
            },
        }
    );
    
    return <Sprite src="/player.png" x={x} y={y} />;
}`} />

            <h2>Collision Tags</h2>
            <p>Use tags to identify different object types:</p>
            <CodeBlock code={`// Coin component
function Coin({ id, x, y, onCollect }) {
    useCollision(
        { left: x - 8, top: y - 8, right: x + 8, bottom: y + 8 },
        {
            tag: 'coin',
            data: { id },  // Attach custom data
        }
    );
    
    return <Circle x={x} y={y} radius={8} color="#ffd700" />;
}

// Enemy component
function Enemy({ x, y }) {
    useCollision(
        { left: x - 16, top: y - 16, right: x + 16, bottom: y + 16 },
        { tag: 'enemy' }
    );
    
    return <Circle x={x} y={y} radius={16} color="#ff0000" />;
}`} />

            <h2>Collision Info</h2>
            <CodeBlock code={`onCollision: (info) => {
    // info.other - the colliding entity
    info.other.tag;   // 'enemy', 'coin', etc.
    info.other.data;  // custom data attached
    
    // info.overlapX / overlapY - overlap amount
    // info.side - 'left', 'right', 'top', 'bottom'
    
    if (info.side === 'bottom') {
        // Landed on something
        isGrounded = true;
    }
}`} />

            <h2>Utility Functions</h2>
            <CodeBlock code={`import { 
    boundsOverlap, 
    circleCollision, 
    pointInBounds, 
    pointInCircle 
} from 'blaze-engine';

// Check if two rectangles overlap
if (boundsOverlap(boundsA, boundsB)) {
    // Collision!
}

// Check circle-circle collision
if (circleCollision(x1, y1, r1, x2, y2, r2)) {
    // Circles touching
}

// Check if point is inside bounds
if (pointInBounds(mouseX, mouseY, buttonBounds)) {
    // Clicked button
}

// Check if point is inside circle
if (pointInCircle(x, y, circleX, circleY, radius)) {
    // Point inside circle
}`} />

            <h2>Options Reference</h2>
            <table className="docs-table">
                <thead>
                    <tr>
                        <th>Option</th>
                        <th>Type</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>tag</td><td>string</td><td>Identifier for this collider</td></tr>
                    <tr><td>data</td><td>any</td><td>Custom data to attach</td></tr>
                    <tr><td>layer</td><td>number</td><td>Collision layer (bitmask)</td></tr>
                    <tr><td>mask</td><td>number</td><td>Which layers to collide with</td></tr>
                    <tr><td>onCollision</td><td>function</td><td>Callback on collision</td></tr>
                </tbody>
            </table>
        </article>
    );
}
