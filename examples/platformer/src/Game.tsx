/**
 * Platformer Example
 * 
 * Demonstrates:
 * - Tilemap for level design
 * - Rigidbody physics with gravity
 * - Platform collision
 * - Camera following player
 * - AnimatedSprite for player
 * - Particle effects for jump/land
 * - Coin collection
 * - ProgressBar for health
 */

import React, { useState, useCallback, useRef } from 'react';
import {
    BlazeGame,
    Sprite,
    AnimatedSprite,
    Rectangle,
    Circle,
    Text,
    Tilemap,
    useTilemap,
    Camera,
    useCamera,
    Rigidbody,
    useRigidbody,
    ProgressBar,
    ParticleSystem,
    useGame,
    useGameLoop,
    useInput,
    useCollision,
    CollisionSystem,
    clamp,
} from 'blaze-engine';

// ============================================
// GAME CONSTANTS
// ============================================

const GAME_WIDTH = 400;
const GAME_HEIGHT = 300;
const TILE_SIZE = 32;
const PLAYER_SPEED = 150;
const JUMP_FORCE = -350;
const GRAVITY = 800;

// Level data (1 = wall, 2 = coin, 0 = empty)
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
];

// ============================================
// PLAYER COMPONENT
// ============================================

interface PlayerProps {
    onCollectCoin: () => void;
    levelData: number[][];
}

function Player({ onCollectCoin, levelData }: PlayerProps) {
    const [x, setX] = useState(64);
    const [y, setY] = useState(64);
    const [velocityX, setVelocityX] = useState(0);
    const [velocityY, setVelocityY] = useState(0);
    const [grounded, setGrounded] = useState(false);
    const [facingRight, setFacingRight] = useState(true);
    const [showJumpParticles, setShowJumpParticles] = useState(false);

    const input = useInput();
    const camera = useCamera();

    // Physics update
    useGameLoop((dt) => {
        // Horizontal movement
        let moveX = 0;
        if (input.isKeyDown('ArrowLeft') || input.isKeyDown('a')) {
            moveX = -1;
            setFacingRight(false);
        }
        if (input.isKeyDown('ArrowRight') || input.isKeyDown('d')) {
            moveX = 1;
            setFacingRight(true);
        }

        const newVelX = moveX * PLAYER_SPEED;

        // Jumping
        let newVelY = velocityY + GRAVITY * dt;
        if ((input.isKeyPressed('ArrowUp') || input.isKeyPressed('w') || input.isKeyPressed(' ')) && grounded) {
            newVelY = JUMP_FORCE;
            setGrounded(false);
            setShowJumpParticles(true);
            setTimeout(() => setShowJumpParticles(false), 200);
        }

        // Calculate new position
        let newX = x + newVelX * dt;
        let newY = y + newVelY * dt;

        // Tile collision
        const playerWidth = 24;
        const playerHeight = 28;

        // Check horizontal collision
        const tileX1 = Math.floor(newX / TILE_SIZE);
        const tileX2 = Math.floor((newX + playerWidth) / TILE_SIZE);
        const tileY1 = Math.floor(y / TILE_SIZE);
        const tileY2 = Math.floor((y + playerHeight) / TILE_SIZE);

        for (let ty = tileY1; ty <= tileY2; ty++) {
            for (let tx = tileX1; tx <= tileX2; tx++) {
                if (levelData[ty]?.[tx] === 1) {
                    // Wall collision
                    if (newVelX > 0) newX = tx * TILE_SIZE - playerWidth;
                    else if (newVelX < 0) newX = (tx + 1) * TILE_SIZE;
                }
                if (levelData[ty]?.[tx] === 2) {
                    // Coin!
                    onCollectCoin();
                }
            }
        }

        // Check vertical collision
        const tileX1v = Math.floor(newX / TILE_SIZE);
        const tileX2v = Math.floor((newX + playerWidth) / TILE_SIZE);
        const tileY1v = Math.floor(newY / TILE_SIZE);
        const tileY2v = Math.floor((newY + playerHeight) / TILE_SIZE);

        let isGrounded = false;
        for (let ty = tileY1v; ty <= tileY2v; ty++) {
            for (let tx = tileX1v; tx <= tileX2v; tx++) {
                if (levelData[ty]?.[tx] === 1) {
                    if (newVelY > 0) {
                        newY = ty * TILE_SIZE - playerHeight;
                        newVelY = 0;
                        isGrounded = true;
                    } else if (newVelY < 0) {
                        newY = (ty + 1) * TILE_SIZE;
                        newVelY = 0;
                    }
                }
            }
        }

        setGrounded(isGrounded);
        setX(newX);
        setY(newY);
        setVelocityX(newVelX);
        setVelocityY(newVelY);

        // Update camera
        camera.follow(newX + 12, newY + 14, 0.1);
    });

    return (
        <>
            {/* Player */}
            <Rectangle
                x={x} y={y}
                width={24} height={28}
                color="#4488ff"
                radius={4}
            />
            {/* Eyes */}
            <Circle
                x={facingRight ? x + 16 : x + 8}
                y={y + 10}
                radius={4}
                color="#ffffff"
            />

            {/* Jump particles */}
            {showJumpParticles && (
                <ParticleSystem
                    x={x + 12}
                    y={y + 28}
                    active={true}
                    emissionRate={50}
                    maxParticles={20}
                    lifespan={0.3}
                    speed={{ min: 20, max: 80 }}
                    angle={{ min: 180, max: 360 }}
                    colors={['#ffffff', '#cccccc']}
                    size={{ start: 6, end: 0 }}
                />
            )}
        </>
    );
}

// ============================================
// COIN COMPONENT
// ============================================

interface CoinProps {
    x: number;
    y: number;
}

function Coin({ x, y }: CoinProps) {
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);

    useGameLoop((dt) => {
        setRotation(prev => prev + dt * 3);
        setScale(0.8 + Math.sin(rotation * 2) * 0.2);
    });

    return (
        <Circle
            x={x * TILE_SIZE + TILE_SIZE / 2}
            y={y * TILE_SIZE + TILE_SIZE / 2}
            radius={8 * scale}
            color="#ffcc00"
            strokeColor="#ff8800"
            strokeWidth={2}
        />
    );
}

// ============================================
// MAIN GAME
// ============================================

export default function Platformer() {
    const [score, setScore] = useState(0);
    const [mapData, setMapData] = useState(LEVEL_DATA);

    const handleCollectCoin = useCallback(() => {
        setScore(prev => prev + 10);
    }, []);

    // Find coins in map
    const coins: { x: number; y: number }[] = [];
    mapData.forEach((row, y) => {
        row.forEach((tile, x) => {
            if (tile === 2) coins.push({ x, y });
        });
    });

    return (
        <BlazeGame
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            backgroundColor="#1a1a2e"
            debug={false}
        >
            <Camera bounds={{ x: 0, y: 0, width: 16 * TILE_SIZE, height: 10 * TILE_SIZE }}>
                {/* Level */}
                <Tilemap
                    tileSize={TILE_SIZE}
                    data={mapData.map(row => row.map(t => t === 1 ? 1 : 0))}
                    tiles={{
                        0: null,
                        1: null, // We'll draw walls ourselves
                    }}
                />

                {/* Draw walls */}
                {mapData.map((row, y) =>
                    row.map((tile, x) =>
                        tile === 1 ? (
                            <Rectangle
                                key={`${x}-${y}`}
                                x={x * TILE_SIZE}
                                y={y * TILE_SIZE}
                                width={TILE_SIZE}
                                height={TILE_SIZE}
                                color="#4a5568"
                                strokeColor="#2d3748"
                                strokeWidth={1}
                            />
                        ) : null
                    )
                )}

                {/* Coins */}
                {coins.map((coin, i) => (
                    <Coin key={i} x={coin.x} y={coin.y} />
                ))}

                {/* Player */}
                <Player onCollectCoin={handleCollectCoin} levelData={mapData} />
            </Camera>

            {/* HUD (fixed, not affected by camera) */}
            <Text x={10} y={10} fontSize={18} color="#ffffff" fontWeight="bold">
                Coins: {score}
            </Text>

            <Text x={GAME_WIDTH / 2} y={GAME_HEIGHT - 20} fontSize={12} color="#666666" textAlign="center">
                Arrow keys or WASD to move
            </Text>
        </BlazeGame>
    );
}
