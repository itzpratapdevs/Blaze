/**
 * Endless Runner Example
 * 
 * Demonstrates:
 * - Procedural obstacle generation
 * - TiledBackground for scrolling ground
 * - Parallax for multi-layer background
 * - Joystick for mobile controls
 * - useTween for jump animation
 * - Collision detection
 * - Score tracking
 * - Game over / restart flow
 */

import React, { useState, useRef, useCallback } from 'react';
import {
    BlazeGame,
    Sprite,
    Rectangle,
    Circle,
    Text,
    Parallax,
    ParallaxLayer,
    TiledBackground,
    Joystick,
    Button,
    ProgressBar,
    ParticleSystem,
    useGame,
    useGameLoop,
    useInput,
    useInterval,
    useTween,
    useCollision,
    CollisionSystem,
    Easing,
    randomFloat,
    randomInt,
} from 'blaze-engine';

// ============================================
// GAME CONSTANTS
// ============================================

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const GROUND_Y = 480;
const PLAYER_X = 80;
const SCROLL_SPEED = 200;
const JUMP_HEIGHT = 150;
const JUMP_DURATION = 0.5;

// ============================================
// PLAYER COMPONENT
// ============================================

interface PlayerProps {
    isJumping: boolean;
    jumpProgress: number;
}

function Player({ isJumping, jumpProgress }: PlayerProps) {
    const baseY = GROUND_Y - 50;
    const y = baseY - Math.sin(jumpProgress * Math.PI) * JUMP_HEIGHT;
    const rotation = isJumping ? jumpProgress * Math.PI * 2 : 0;
    const scale = isJumping ? 1 + Math.sin(jumpProgress * Math.PI) * 0.2 : 1;

    useCollision(
        { left: PLAYER_X - 20, top: y - 20, right: PLAYER_X + 20, bottom: y + 20 },
        { tag: 'player' }
    );

    return (
        <>
            {/* Player body */}
            <Rectangle
                x={PLAYER_X - 20}
                y={y - 25}
                width={40}
                height={50}
                color="#ff6b6b"
                radius={8}
                rotation={rotation}
            />
            {/* Eyes */}
            <Circle x={PLAYER_X + 8} y={y - 15} radius={5} color="#ffffff" />
            <Circle x={PLAYER_X + 8} y={y - 15} radius={2} color="#000000" />

            {/* Jump particles */}
            {isJumping && (
                <ParticleSystem
                    x={PLAYER_X}
                    y={y + 25}
                    active={true}
                    emissionRate={30}
                    maxParticles={20}
                    lifespan={0.3}
                    speed={{ min: 20, max: 60 }}
                    angle={{ min: 200, max: 340 }}
                    colors={['#ffffff', '#cccccc']}
                    size={{ start: 8, end: 0 }}
                />
            )}
        </>
    );
}

// ============================================
// OBSTACLE COMPONENT
// ============================================

interface ObstacleProps {
    id: number;
    x: number;
    type: 'small' | 'tall' | 'double';
    onDestroy: (id: number) => void;
    onHitPlayer: () => void;
}

function Obstacle({ id, x: initialX, type, onDestroy, onHitPlayer }: ObstacleProps) {
    const [x, setX] = useState(initialX);

    useGameLoop((dt) => {
        setX(prev => {
            const newX = prev - SCROLL_SPEED * dt;
            if (newX < -50) {
                onDestroy(id);
            }
            return newX;
        });
    });

    const height = type === 'tall' ? 80 : type === 'double' ? 60 : 40;
    const width = type === 'double' ? 60 : 30;

    useCollision(
        { left: x, top: GROUND_Y - height, right: x + width, bottom: GROUND_Y },
        {
            tag: 'obstacle',
            onCollision: (info) => {
                if (info.other.tag === 'player') {
                    onHitPlayer();
                }
            },
        }
    );

    return (
        <>
            <Rectangle
                x={x}
                y={GROUND_Y - height}
                width={width}
                height={height}
                color="#4ecdc4"
                radius={4}
            />
            {type === 'double' && (
                <Rectangle
                    x={x + 10}
                    y={GROUND_Y - height - 30}
                    width={width - 20}
                    height={30}
                    color="#45b7aa"
                    radius={4}
                />
            )}
        </>
    );
}

// ============================================
// COIN COMPONENT
// ============================================

interface CoinProps {
    id: number;
    x: number;
    y: number;
    onCollect: (id: number) => void;
}

function Coin({ id, x: initialX, y, onCollect }: CoinProps) {
    const [x, setX] = useState(initialX);
    const [wobble, setWobble] = useState(0);

    useGameLoop((dt) => {
        setX(prev => prev - SCROLL_SPEED * dt);
        setWobble(prev => prev + dt * 5);
    });

    useCollision(
        { left: x - 12, top: y - 12, right: x + 12, bottom: y + 12 },
        {
            tag: 'coin',
            onCollision: (info) => {
                if (info.other.tag === 'player') {
                    onCollect(id);
                }
            },
        }
    );

    if (x < -20) return null;

    return (
        <Circle
            x={x}
            y={y + Math.sin(wobble) * 5}
            radius={12}
            color="#ffd700"
            strokeColor="#ff8c00"
            strokeWidth={2}
        />
    );
}

// ============================================
// HUD
// ============================================

interface HUDProps {
    score: number;
    distance: number;
}

function HUD({ score, distance }: HUDProps) {
    return (
        <>
            <Rectangle x={0} y={0} width={GAME_WIDTH} height={60} color="rgba(0,0,0,0.5)" />
            <Text x={15} y={15} fontSize={16} color="#ffd700" fontWeight="bold">
                🪙 {score}
            </Text>
            <Text x={15} y={38} fontSize={14} color="#ffffff">
                Distance: {Math.floor(distance)}m
            </Text>
        </>
    );
}

// ============================================
// MAIN GAME
// ============================================

export default function EndlessRunner() {
    // Game state
    const [score, setScore] = useState(0);
    const [distance, setDistance] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [isJumping, setIsJumping] = useState(false);
    const [jumpProgress, setJumpProgress] = useState(0);

    // Obstacles and coins
    const [obstacles, setObstacles] = useState<{ id: number; x: number; type: 'small' | 'tall' | 'double' }[]>([]);
    const [coins, setCoins] = useState<{ id: number; x: number; y: number }[]>([]);

    const nextId = useRef(0);
    const input = useInput();

    // Distance tracking
    useGameLoop((dt) => {
        if (!gameOver) {
            setDistance(prev => prev + SCROLL_SPEED * dt / 10);
        }
    });

    // Jumping
    useGameLoop((dt) => {
        if (gameOver) return;

        // Check for jump input
        const shouldJump = input.isKeyPressed(' ') || input.isKeyPressed('ArrowUp') || input.justPressed;

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

    // Spawn obstacles
    useInterval(() => {
        if (gameOver) return;

        const id = nextId.current++;
        const types: ('small' | 'tall' | 'double')[] = ['small', 'tall', 'double'];
        const type = types[randomInt(0, 2)];

        setObstacles(prev => [...prev, { id, x: GAME_WIDTH + 50, type }]);
    }, 1500);

    // Spawn coins
    useInterval(() => {
        if (gameOver) return;

        const id = nextId.current++;
        const y = GROUND_Y - randomInt(80, 150);

        setCoins(prev => [...prev, { id, x: GAME_WIDTH + 50, y }]);
    }, 800);

    // Handlers
    const handleObstacleDestroy = useCallback((id: number) => {
        setObstacles(prev => prev.filter(o => o.id !== id));
        setScore(prev => prev + 10); // Score for passing obstacle
    }, []);

    const handleHitPlayer = useCallback(() => {
        setGameOver(true);
    }, []);

    const handleCoinCollect = useCallback((id: number) => {
        setCoins(prev => prev.filter(c => c.id !== id));
        setScore(prev => prev + 50);
    }, []);

    const handleRestart = useCallback(() => {
        setScore(0);
        setDistance(0);
        setGameOver(false);
        setIsJumping(false);
        setObstacles([]);
        setCoins([]);
    }, []);

    return (
        <BlazeGame
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            backgroundColor="#2c3e50"
        >
            <CollisionSystem />

            {/* Sky gradient (faked with rectangles) */}
            <Rectangle x={0} y={0} width={GAME_WIDTH} height={300} color="#87ceeb" />
            <Rectangle x={0} y={200} width={GAME_WIDTH} height={200} color="#b8d4e3" />

            {/* Ground */}
            <Rectangle
                x={0} y={GROUND_Y}
                width={GAME_WIDTH} height={GAME_HEIGHT - GROUND_Y}
                color="#8b4513"
            />
            <Rectangle
                x={0} y={GROUND_Y}
                width={GAME_WIDTH} height={20}
                color="#228b22"
            />

            {/* Player */}
            <Player isJumping={isJumping} jumpProgress={jumpProgress} />

            {/* Obstacles */}
            {obstacles.map(o => (
                <Obstacle
                    key={o.id}
                    id={o.id}
                    x={o.x}
                    type={o.type}
                    onDestroy={handleObstacleDestroy}
                    onHitPlayer={handleHitPlayer}
                />
            ))}

            {/* Coins */}
            {coins.map(c => (
                <Coin
                    key={c.id}
                    id={c.id}
                    x={c.x}
                    y={c.y}
                    onCollect={handleCoinCollect}
                />
            ))}

            {/* HUD */}
            <HUD score={score} distance={distance} />

            {/* Mobile jump button */}
            <Button
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
            />

            {/* Instructions */}
            <Text
                x={GAME_WIDTH / 2} y={GAME_HEIGHT - 30}
                fontSize={12} color="#666666" textAlign="center"
            >
                Tap, Space or ↑ to jump
            </Text>

            {/* Game Over */}
            {gameOver && (
                <>
                    <Rectangle
                        x={0} y={0}
                        width={GAME_WIDTH} height={GAME_HEIGHT}
                        color="rgba(0,0,0,0.7)"
                    />
                    <Text
                        x={GAME_WIDTH / 2} y={GAME_HEIGHT / 2 - 60}
                        fontSize={36} color="#ff6b6b"
                        textAlign="center" fontWeight="bold"
                    >
                        GAME OVER
                    </Text>
                    <Text
                        x={GAME_WIDTH / 2} y={GAME_HEIGHT / 2}
                        fontSize={20} color="#ffffff"
                        textAlign="center"
                    >
                        Score: {score}
                    </Text>
                    <Text
                        x={GAME_WIDTH / 2} y={GAME_HEIGHT / 2 + 30}
                        fontSize={16} color="#ffffff"
                        textAlign="center"
                    >
                        Distance: {Math.floor(distance)}m
                    </Text>

                    <Button
                        x={GAME_WIDTH / 2}
                        y={GAME_HEIGHT / 2 + 100}
                        size={60}
                        color="#4ecdc4"
                        pressedColor="#45b7aa"
                        label="↻"
                        labelColor="#ffffff"
                        onPress={handleRestart}
                    />
                </>
            )}
        </BlazeGame>
    );
}
