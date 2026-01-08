import { CodeBlock } from '../../../components/CodeBlock';

export default function EndlessRunnerExample() {
    return (
        <article className="docs-content">
            <h1>🏃 Endless Runner Example</h1>
            <p className="lead">
                An endless runner with procedural obstacles, coins, and mobile joystick controls.
            </p>

            <h2>Features Demonstrated</h2>
            <ul>
                <li><strong>Procedural Generation</strong> - Random obstacle spawning</li>
                <li><strong>useInterval</strong> - Timed spawning</li>
                <li><strong>Button</strong> - Mobile jump button</li>
                <li><strong>useTween</strong> - Jump animation</li>
                <li><strong>useCollision</strong> - Obstacle and coin collision</li>
                <li><strong>ParticleSystem</strong> - Jump dust</li>
                <li><strong>Shapes</strong> - Ground, obstacles, coins</li>
                <li><strong>Game State</strong> - Score, game over, restart</li>
            </ul>

            <h2>Jumping Mechanics</h2>
            <CodeBlock code={`function Game() {
    const [isJumping, setIsJumping] = useState(false);
    const [jumpProgress, setJumpProgress] = useState(0);
    const input = useInput();
    
    useGameLoop((dt) => {
        // Check for jump input
        const shouldJump = input.isKeyPressed('Space') || input.justPressed;
        
        if (shouldJump && !isJumping) {
            setIsJumping(true);
            setJumpProgress(0);
        }
        
        if (isJumping) {
            setJumpProgress(prev => {
                const next = prev + dt / JUMP_DURATION;
                if (next >= 1) {
                    setIsJumping(false);
                    return 0;
                }
                return next;
            });
        }
    });
    
    // Calculate Y position using sine for smooth arc
    const baseY = GROUND_Y - 50;
    const y = baseY - Math.sin(jumpProgress * Math.PI) * JUMP_HEIGHT;
    
    return <Player y={y} />;
}`} />

            <h2>Obstacle Spawning</h2>
            <CodeBlock code={`// Spawn obstacles at random intervals
useInterval(() => {
    if (gameOver) return;
    
    const id = nextId.current++;
    const types = ['small', 'tall', 'double'];
    const type = types[randomInt(0, 2)];
    
    setObstacles(prev => [...prev, { 
        id, 
        x: GAME_WIDTH + 50, 
        type 
    }]);
}, 1500);

// In Obstacle component - scroll left
useGameLoop((dt) => {
    setX(prev => {
        const newX = prev - SCROLL_SPEED * dt;
        if (newX < -50) {
            onDestroy(id);
            addScore(10); // Survived!
        }
        return newX;
    });
});`} />

            <h2>Mobile Button</h2>
            <CodeBlock code={`<Button
    x={GAME_WIDTH - 60}
    y={GAME_HEIGHT - 80}
    size={80}
    color="rgba(255, 255, 255, 0.3)"
    pressedColor="rgba(255, 255, 255, 0.5)"
    label="JUMP"
    labelColor="#ffffff"
    onPress={() => {
        if (!isJumping && !gameOver) {
            setIsJumping(true);
            setJumpProgress(0);
        }
    }}
/>`} />

            <h2>Game Over & Restart</h2>
            <CodeBlock code={`// Collision triggers game over
useCollision(bounds, {
    tag: 'obstacle',
    onCollision: (info) => {
        if (info.other.tag === 'player') {
            setGameOver(true);
        }
    },
});

// Restart handler
const handleRestart = () => {
    setScore(0);
    setDistance(0);
    setGameOver(false);
    setObstacles([]);
    setCoins([]);
};

// Restart button
{gameOver && (
    <Button
        x={GAME_WIDTH / 2}
        y={GAME_HEIGHT / 2 + 100}
        size={60}
        label="↻"
        onPress={handleRestart}
    />
)}`} />

            <h2>Distance Tracking</h2>
            <CodeBlock code={`useGameLoop((dt) => {
    if (!gameOver) {
        setDistance(prev => prev + SCROLL_SPEED * dt / 10);
    }
});

// Display
<Text x={15} y={38} fontSize={14} color="#ffffff">
    Distance: {Math.floor(distance)}m
</Text>`} />
        </article>
    );
}
