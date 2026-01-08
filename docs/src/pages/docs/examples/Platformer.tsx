import { CodeBlock } from '../../../components/CodeBlock';

export default function PlatformerExample() {
    return (
        <article className="docs-content">
            <h1>🎮 Platformer Example</h1>
            <p className="lead">
                A classic platformer with tile-based levels, physics, and coin collection.
            </p>

            <h2>Features Demonstrated</h2>
            <ul>
                <li><strong>Tilemap</strong> - Grid-based level design</li>
                <li><strong>Camera</strong> - Following player with bounds</li>
                <li><strong>Physics</strong> - Gravity and jumping</li>
                <li><strong>Tile Collision</strong> - Platform detection</li>
                <li><strong>useInput</strong> - WASD / Arrow key controls</li>
                <li><strong>ParticleSystem</strong> - Jump dust effects</li>
                <li><strong>Shapes</strong> - Rectangle and Circle rendering</li>
            </ul>

            <h2>Level Data</h2>
            <CodeBlock code={`// 1 = wall, 2 = coin, 0 = empty
const LEVEL_DATA = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1],
    [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];`} />

            <h2>Player Movement & Physics</h2>
            <CodeBlock code={`function Player({ levelData }) {
    const [x, setX] = useState(64);
    const [y, setY] = useState(64);
    const [velocityY, setVelocityY] = useState(0);
    const [grounded, setGrounded] = useState(false);
    
    const input = useInput();
    const camera = useCamera();
    
    useGameLoop((dt) => {
        // Horizontal movement
        let moveX = 0;
        if (input.isKeyDown('ArrowLeft')) moveX = -1;
        if (input.isKeyDown('ArrowRight')) moveX = 1;
        
        // Gravity
        let newVelY = velocityY + GRAVITY * dt;
        
        // Jump
        if (input.isKeyPressed('Space') && grounded) {
            newVelY = JUMP_FORCE;
            setGrounded(false);
        }
        
        // Calculate new position
        let newX = x + moveX * PLAYER_SPEED * dt;
        let newY = y + newVelY * dt;
        
        // Tile collision (simplified)
        const tileX = Math.floor(newX / TILE_SIZE);
        const tileY = Math.floor(newY / TILE_SIZE);
        
        if (levelData[tileY]?.[tileX] === 1) {
            // Hit a wall - resolve collision
            newY = (tileY) * TILE_SIZE - 1;
            newVelY = 0;
            setGrounded(true);
        }
        
        setX(newX);
        setY(newY);
        setVelocityY(newVelY);
        
        // Camera follows player
        camera.follow(newX, newY, 0.1);
    });
    
    return (
        <Rectangle x={x} y={y} width={24} height={28} color="#4488ff" radius={4} />
    );
}`} />

            <h2>Camera with Bounds</h2>
            <CodeBlock code={`<Camera bounds={{ 
    x: 0, 
    y: 0, 
    width: 16 * TILE_SIZE,  // Level width
    height: 10 * TILE_SIZE  // Level height
}}>
    {/* Level and player */}
</Camera>`} />

            <h2>Tile Rendering</h2>
            <CodeBlock code={`{/* Render walls */}
{levelData.map((row, y) => 
    row.map((tile, x) => 
        tile === 1 ? (
            <Rectangle 
                key={\`\${x}-\${y}\`}
                x={x * TILE_SIZE} 
                y={y * TILE_SIZE}
                width={TILE_SIZE}
                height={TILE_SIZE}
                color="#4a5568"
            />
        ) : null
    )
)}`} />
        </article>
    );
}
