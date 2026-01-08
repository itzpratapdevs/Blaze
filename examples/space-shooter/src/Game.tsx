/**
 * Space Shooter Example
 * 
 * Demonstrates:
 * - Sprite rendering
 * - useGameLoop for enemy spawning
 * - ParticleSystem for explosions
 * - Parallax background
 * - useCollision for bullet-enemy collision
 * - Text for score display
 * - useTimer for spawn intervals
 * - useInput for controls
 * - ScreenShake for hit effects
 */

import React, { useState, useRef, useCallback } from 'react';
import {
    BlazeGame,
    Sprite,
    Rectangle,
    Circle,
    Text,
    ParticleSystem,
    Parallax,
    ParallaxLayer,
    TiledBackground,
    Camera,
    ScreenShake,
    useGame,
    useGameLoop,
    useInput,
    useTimer,
    useInterval,
    useCollision,
    CollisionSystem,
    useTween,
    Easing,
    randomFloat,
    randomInt,
    Vector2,
} from 'blaze-engine';

// ============================================
// GAME CONSTANTS
// ============================================

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const PLAYER_SPEED = 250;
const BULLET_SPEED = 500;
const ENEMY_SPEED = 150;

// ============================================
// PLAYER COMPONENT
// ============================================

interface PlayerProps {
    onShoot: (x: number, y: number) => void;
}

function Player({ onShoot }: PlayerProps) {
    const [x, setX] = useState(GAME_WIDTH / 2);
    const y = GAME_HEIGHT - 80;
    const input = useInput();

    // Movement
    useGameLoop((dt) => {
        let dx = 0;
        if (input.isKeyDown('ArrowLeft') || input.isKeyDown('a')) dx -= 1;
        if (input.isKeyDown('ArrowRight') || input.isKeyDown('d')) dx += 1;

        // Touch/mouse
        if (input.isPressed) {
            const targetX = input.position.x;
            if (targetX < x - 10) dx = -1;
            if (targetX > x + 10) dx = 1;
        }

        setX(prev => {
            const newX = prev + dx * PLAYER_SPEED * dt;
            return Math.max(20, Math.min(GAME_WIDTH - 20, newX));
        });
    });

    // Shooting
    useInterval(() => {
        onShoot(x, y - 20);
    }, 200); // Fire every 200ms

    // Register collision
    useCollision(
        { left: x - 15, top: y - 15, right: x + 15, bottom: y + 15 },
        { tag: 'player' }
    );

    return (
        <>
            {/* Player ship (triangle) */}
            <Circle x={x} y={y} radius={20} color="#00ffff" />
            <Circle x={x} y={y - 10} radius={8} color="#ffffff" />

            {/* Engine glow */}
            <Circle x={x} y={y + 15} radius={6} color="#ff8800" opacity={0.8} />
        </>
    );
}

// ============================================
// BULLET COMPONENT
// ============================================

interface BulletProps {
    id: number;
    x: number;
    y: number;
    onDestroy: (id: number) => void;
    onHit: (id: number, enemyId: number) => void;
}

function Bullet({ id, x: initialX, y: initialY, onDestroy, onHit }: BulletProps) {
    const [y, setY] = useState(initialY);

    useGameLoop((dt) => {
        setY(prev => {
            const newY = prev - BULLET_SPEED * dt;
            if (newY < -10) {
                onDestroy(id);
            }
            return newY;
        });
    });

    useCollision(
        { left: initialX - 3, top: y - 8, right: initialX + 3, bottom: y + 8 },
        {
            tag: 'bullet',
            onCollision: (info) => {
                if (info.other.tag === 'enemy') {
                    onHit(id, info.other.data?.id);
                }
            },
        }
    );

    return (
        <Rectangle x={initialX - 2} y={y - 8} width={4} height={16} color="#ffff00" />
    );
}

// ============================================
// ENEMY COMPONENT
// ============================================

interface EnemyProps {
    id: number;
    x: number;
    y: number;
    onDestroy: (id: number) => void;
    onReachBottom: () => void;
}

function Enemy({ id, x, y: initialY, onDestroy, onReachBottom }: EnemyProps) {
    const [y, setY] = useState(initialY);
    const [wobble, setWobble] = useState(0);

    useGameLoop((dt) => {
        setY(prev => {
            const newY = prev + ENEMY_SPEED * dt;
            if (newY > GAME_HEIGHT + 30) {
                onDestroy(id);
                onReachBottom();
            }
            return newY;
        });
        setWobble(prev => prev + dt * 5);
    });

    const displayX = x + Math.sin(wobble) * 20;

    useCollision(
        { left: displayX - 20, top: y - 20, right: displayX + 20, bottom: y + 20 },
        { tag: 'enemy', data: { id } }
    );

    return (
        <Circle x={displayX} y={y} radius={22} color="#ff4444" />
    );
}

// ============================================
// EXPLOSION EFFECT
// ============================================

interface ExplosionProps {
    x: number;
    y: number;
    onComplete: () => void;
}

function Explosion({ x, y, onComplete }: ExplosionProps) {
    const timer = useTimer(0.5, { autoStart: true, onComplete });

    return (
        <ParticleSystem
            x={x}
            y={y}
            active={!timer.isComplete}
            emissionRate={200}
            maxParticles={50}
            lifespan={{ min: 0.2, max: 0.5 }}
            speed={{ min: 100, max: 300 }}
            angle={{ min: 0, max: 360 }}
            colors={['#ff0000', '#ff8800', '#ffff00', '#ffffff']}
            size={{ start: 12, end: 0 }}
        />
    );
}

// ============================================
// HUD
// ============================================

interface HUDProps {
    score: number;
    lives: number;
}

function HUD({ score, lives }: HUDProps) {
    return (
        <>
            <Text x={10} y={10} fontSize={20} color="#ffffff" fontWeight="bold">
                SCORE: {score}
            </Text>
            <Text x={GAME_WIDTH - 10} y={10} fontSize={20} color="#ff4444" fontWeight="bold" textAlign="right">
                {'❤️'.repeat(lives)}
            </Text>
        </>
    );
}

// ============================================
// MAIN GAME
// ============================================

export default function SpaceShooter() {
    // Game state
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [gameOver, setGameOver] = useState(false);
    const [shake, setShake] = useState(false);

    // Entity lists
    const [bullets, setBullets] = useState<{ id: number; x: number; y: number }[]>([]);
    const [enemies, setEnemies] = useState<{ id: number; x: number; y: number }[]>([]);
    const [explosions, setExplosions] = useState<{ id: number; x: number; y: number }[]>([]);

    const nextId = useRef(0);

    // Spawn enemies
    useInterval(() => {
        if (gameOver) return;

        const id = nextId.current++;
        const x = randomFloat(40, GAME_WIDTH - 40);
        setEnemies(prev => [...prev, { id, x, y: -30 }]);
    }, 1000);

    // Handlers
    const handleShoot = useCallback((x: number, y: number) => {
        if (gameOver) return;
        const id = nextId.current++;
        setBullets(prev => [...prev, { id, x, y }]);
    }, [gameOver]);

    const handleBulletDestroy = useCallback((id: number) => {
        setBullets(prev => prev.filter(b => b.id !== id));
    }, []);

    const handleBulletHit = useCallback((bulletId: number, enemyId: number) => {
        // Remove bullet and enemy
        setBullets(prev => prev.filter(b => b.id !== bulletId));

        setEnemies(prev => {
            const enemy = prev.find(e => e.id === enemyId);
            if (enemy) {
                // Create explosion
                const expId = nextId.current++;
                setExplosions(p => [...p, { id: expId, x: enemy.x, y: 0 }]);
                setScore(s => s + 100);
            }
            return prev.filter(e => e.id !== enemyId);
        });

        setShake(true);
        setTimeout(() => setShake(false), 100);
    }, []);

    const handleEnemyDestroy = useCallback((id: number) => {
        setEnemies(prev => prev.filter(e => e.id !== id));
    }, []);

    const handleEnemyReachBottom = useCallback(() => {
        setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) setGameOver(true);
            return newLives;
        });
        setShake(true);
        setTimeout(() => setShake(false), 200);
    }, []);

    const handleExplosionComplete = useCallback((id: number) => {
        setExplosions(prev => prev.filter(e => e.id !== id));
    }, []);

    const handleRestart = useCallback(() => {
        setScore(0);
        setLives(3);
        setGameOver(false);
        setBullets([]);
        setEnemies([]);
        setExplosions([]);
    }, []);

    return (
        <BlazeGame
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            backgroundColor="#0a0a2e"
            debug={false}
        >
            <CollisionSystem />

            <Camera>
                <ScreenShake trigger={shake} intensity={8} duration={0.2} />

                {/* Starfield background */}
                <TiledBackground src="/stars.png" scrollY={50} opacity={0.5} />

                {/* Game entities */}
                {!gameOver && <Player onShoot={handleShoot} />}

                {bullets.map(b => (
                    <Bullet
                        key={b.id}
                        id={b.id}
                        x={b.x}
                        y={b.y}
                        onDestroy={handleBulletDestroy}
                        onHit={handleBulletHit}
                    />
                ))}

                {enemies.map(e => (
                    <Enemy
                        key={e.id}
                        id={e.id}
                        x={e.x}
                        y={e.y}
                        onDestroy={handleEnemyDestroy}
                        onReachBottom={handleEnemyReachBottom}
                    />
                ))}

                {explosions.map(e => (
                    <Explosion
                        key={e.id}
                        x={e.x}
                        y={e.y}
                        onComplete={() => handleExplosionComplete(e.id)}
                    />
                ))}

                {/* HUD */}
                <HUD score={score} lives={lives} />

                {/* Game Over */}
                {gameOver && (
                    <>
                        <Rectangle
                            x={0} y={0}
                            width={GAME_WIDTH} height={GAME_HEIGHT}
                            color="rgba(0,0,0,0.7)"
                        />
                        <Text
                            x={GAME_WIDTH / 2} y={GAME_HEIGHT / 2 - 40}
                            fontSize={40} color="#ff4444"
                            textAlign="center" fontWeight="bold"
                        >
                            GAME OVER
                        </Text>
                        <Text
                            x={GAME_WIDTH / 2} y={GAME_HEIGHT / 2 + 20}
                            fontSize={24} color="#ffffff"
                            textAlign="center"
                        >
                            Score: {score}
                        </Text>
                        <Text
                            x={GAME_WIDTH / 2} y={GAME_HEIGHT / 2 + 80}
                            fontSize={18} color="#888888"
                            textAlign="center"
                        >
                            Click to restart
                        </Text>
                    </>
                )}
            </Camera>
        </BlazeGame>
    );
}
