import { CodeBlock } from '../../../components/CodeBlock';

export default function SpaceShooterExample() {
    return (
        <article className="docs-content">
            <h1>🚀 Space Shooter Example</h1>
            <p className="lead">
                A complete vertical scrolling shooter demonstrating sprites, particles, collision, and game state.
            </p>

            <h2>Features Demonstrated</h2>
            <ul>
                <li><strong>Sprites</strong> - Player ship, enemies, bullets</li>
                <li><strong>ParticleSystem</strong> - Explosions on enemy destruction</li>
                <li><strong>useCollision</strong> - Bullet-enemy hit detection</li>
                <li><strong>useInput</strong> - Keyboard and touch controls</li>
                <li><strong>useInterval</strong> - Enemy spawning</li>
                <li><strong>ScreenShake</strong> - Impact effects</li>
                <li><strong>Text</strong> - Score and lives display</li>
                <li><strong>TiledBackground</strong> - Scrolling starfield</li>
            </ul>

            <h2>Complete Code</h2>
            <CodeBlock code={`import React, { useState, useRef, useCallback } from 'react';
import {
    BlazeGame,
    Circle,
    Rectangle,
    Text,
    ParticleSystem,
    Camera,
    ScreenShake,
    useGameLoop,
    useInput,
    useInterval,
    useCollision,
    CollisionSystem,
    randomFloat,
} from 'blaze-engine';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const PLAYER_SPEED = 250;
const BULLET_SPEED = 500;
const ENEMY_SPEED = 150;

function Player({ onShoot }) {
    const [x, setX] = useState(GAME_WIDTH / 2);
    const y = GAME_HEIGHT - 80;
    const input = useInput();
    
    useGameLoop((dt) => {
        let dx = 0;
        if (input.isKeyDown('ArrowLeft')) dx -= 1;
        if (input.isKeyDown('ArrowRight')) dx += 1;
        
        setX(prev => Math.max(20, Math.min(GAME_WIDTH - 20, 
            prev + dx * PLAYER_SPEED * dt)));
    });
    
    useInterval(() => onShoot(x, y - 20), 200);
    
    useCollision(
        { left: x - 15, top: y - 15, right: x + 15, bottom: y + 15 },
        { tag: 'player' }
    );
    
    return (
        <>
            <Circle x={x} y={y} radius={20} color="#00ffff" />
            <Circle x={x} y={y - 10} radius={8} color="#ffffff" />
        </>
    );
}

function Enemy({ id, x, y: initialY, onDestroy, onReachBottom }) {
    const [y, setY] = useState(initialY);
    
    useGameLoop((dt) => {
        setY(prev => {
            const newY = prev + ENEMY_SPEED * dt;
            if (newY > GAME_HEIGHT + 30) {
                onDestroy(id);
                onReachBottom();
            }
            return newY;
        });
    });
    
    useCollision(
        { left: x - 20, top: y - 20, right: x + 20, bottom: y + 20 },
        { tag: 'enemy', data: { id } }
    );
    
    return <Circle x={x} y={y} radius={22} color="#ff4444" />;
}

export default function SpaceShooter() {
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [gameOver, setGameOver] = useState(false);
    const [shake, setShake] = useState(false);
    const [enemies, setEnemies] = useState([]);
    const nextId = useRef(0);
    
    useInterval(() => {
        if (gameOver) return;
        const id = nextId.current++;
        setEnemies(prev => [...prev, { 
            id, 
            x: randomFloat(40, GAME_WIDTH - 40), 
            y: -30 
        }]);
    }, 1000);
    
    return (
        <BlazeGame width={GAME_WIDTH} height={GAME_HEIGHT} backgroundColor="#0a0a2e">
            <CollisionSystem />
            <Camera>
                <ScreenShake trigger={shake} intensity={8} duration={0.2} />
                <Player onShoot={(x, y) => {/* shoot logic */}} />
                {enemies.map(e => (
                    <Enemy key={e.id} {...e} 
                        onDestroy={(id) => setEnemies(p => p.filter(e => e.id !== id))}
                        onReachBottom={() => setLives(l => l - 1)}
                    />
                ))}
                <Text x={10} y={10} fontSize={20} color="#ffffff">
                    Score: {score}
                </Text>
            </Camera>
        </BlazeGame>
    );
}`} />

            <h2>Key Concepts</h2>

            <h3>Entity Spawning</h3>
            <CodeBlock code={`// Spawn enemies at regular intervals
useInterval(() => {
    const id = nextId.current++;
    setEnemies(prev => [...prev, { 
        id, 
        x: randomFloat(40, GAME_WIDTH - 40), 
        y: -30 
    }]);
}, 1000); // Every second`} />

            <h3>Collision Detection</h3>
            <CodeBlock code={`// Bullet checks for enemy collision
useCollision(bounds, {
    tag: 'bullet',
    onCollision: (info) => {
        if (info.other.tag === 'enemy') {
            destroyEnemy(info.other.data.id);
            destroyBullet(id);
            createExplosion(x, y);
        }
    },
});`} />

            <h3>Screen Shake on Hit</h3>
            <CodeBlock code={`// Trigger shake
setShake(true);
setTimeout(() => setShake(false), 100);

// In render
<ScreenShake trigger={shake} intensity={8} duration={0.2} />`} />
        </article>
    );
}
