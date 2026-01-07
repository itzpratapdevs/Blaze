import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import {
    BlazeCanvas,
    useGame,
    useGameLoop,
    useTouch,
    SpriteComponent as Sprite,
    ColliderComponent as Collider,
    ColliderProvider,
    SpriteProvider,
    CollisionLayers,
    Vector2,
} from 'blaze-engine';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 20;
const BALL_RADIUS = 10;
const BRICK_Rows = 5;
const BRICK_COLS = 8;
const BRICK_HEIGHT = 25;
const BRICK_MARGIN = 5;
const BRICK_WIDTH = (SCREEN_WIDTH - (BRICK_COLS + 1) * BRICK_MARGIN) / BRICK_COLS;

export function Breakout() {
    const { game, isRunning, start } = useGame({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        backgroundColor: '#202028',
    });

    return (
        <View style={{ flex: 1 }}>
            <ColliderProvider>
                <SpriteProvider>
                    <BlazeCanvas game={game} style={{ flex: 1 }}>
                        {isRunning && <GameLogic />}
                    </BlazeCanvas>
                </SpriteProvider>
            </ColliderProvider>

            {!isRunning && (
                <View style={styles.center}>
                    <TouchableOpacity onPress={start} style={styles.btn}>
                        <Text style={styles.btnText}>Start Breakout</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

function GameLogic() {
    const { x: touchX, isTouching } = useTouch();

    // Paddle
    const [paddleX, setPaddleX] = useState(SCREEN_WIDTH / 2);

    // Ball
    const [ballPos, setBallPos] = useState(new Vector2(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2));
    const ballVel = useRef(new Vector2(200, -200));

    // Bricks
    const [bricks, setBricks] = useState<any[]>(() => {
        const list = [];
        for (let r = 0; r < BRICK_Rows; r++) {
            for (let c = 0; c < BRICK_COLS; c++) {
                list.push({
                    id: `${r}-${c}`,
                    x: BRICK_MARGIN + c * (BRICK_WIDTH + BRICK_MARGIN),
                    y: 50 + r * (BRICK_HEIGHT + BRICK_MARGIN),
                    active: true,
                    color: `hsl(${c * 45}, 70%, 50%)`
                });
            }
        }
        return list;
    });

    useGameLoop((dt) => {
        // Move Paddle
        if (isTouching) {
            setPaddleX(Math.max(PADDLE_WIDTH / 2, Math.min(SCREEN_WIDTH - PADDLE_WIDTH / 2, touchX)));
        }

        // Move Ball
        const nextPos = ballPos.clone().add(ballVel.current.clone().scale(dt));

        // Wall Bounce
        if (nextPos.x < BALL_RADIUS || nextPos.x > SCREEN_WIDTH - BALL_RADIUS) {
            ballVel.current.x *= -1;
            nextPos.x = Math.max(BALL_RADIUS, Math.min(SCREEN_WIDTH - BALL_RADIUS, nextPos.x));
        }
        if (nextPos.y < BALL_RADIUS) {
            ballVel.current.y *= -1;
            nextPos.y = BALL_RADIUS;
        }

        // Paddle Bounce (Simple box check)
        if (nextPos.y > SCREEN_HEIGHT - 60 - BALL_RADIUS &&
            nextPos.y < SCREEN_HEIGHT - 60 + BALL_RADIUS &&
            nextPos.x > paddleX - PADDLE_WIDTH / 2 &&
            nextPos.x < paddleX + PADDLE_WIDTH / 2) {
            ballVel.current.y *= -1;
            // Add some "english" based on hit position
            const hitOffset = (nextPos.x - paddleX) / (PADDLE_WIDTH / 2);
            ballVel.current.x += hitOffset * 100;
            nextPos.y = SCREEN_HEIGHT - 60 - BALL_RADIUS - 1;
        }

        // Brick Collision (Brute force for demo)
        setBricks(prev => prev.map(brick => {
            if (!brick.active) return brick;
            if (nextPos.x > brick.x && nextPos.x < brick.x + BRICK_WIDTH &&
                nextPos.y > brick.y && nextPos.y < brick.y + BRICK_HEIGHT) {
                ballVel.current.y *= -1;
                return { ...brick, active: false };
            }
            return brick;
        }));

        // Floor (Game Over condition - ignored for endless demo)
        if (nextPos.y > SCREEN_HEIGHT) {
            nextPos.set(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);
            ballVel.current.set(200, -200);
        }

        setBallPos(nextPos);
    });

    return (
        <>
            {/* Paddle */}
            <Sprite
                x={paddleX}
                y={SCREEN_HEIGHT - 50}
                width={PADDLE_WIDTH}
                height={PADDLE_HEIGHT}
                anchorX={0.5}
                anchorY={0.5}
                tint="#00d9ff"
            />
            <Collider id="paddle" x={paddleX - PADDLE_WIDTH / 2} y={SCREEN_HEIGHT - 60} width={PADDLE_WIDTH} height={PADDLE_HEIGHT} />

            {/* Ball */}
            <Sprite
                x={ballPos.x}
                y={ballPos.y}
                width={BALL_RADIUS * 2}
                height={BALL_RADIUS * 2}
                anchorX={0.5}
                anchorY={0.5}
                tint="#ffffff"
            />

            {/* Bricks */}
            {bricks.map(brick => brick.active && (
                <Sprite
                    key={brick.id}
                    x={brick.x}
                    y={brick.y}
                    width={BRICK_WIDTH}
                    height={BRICK_HEIGHT}
                    tint={brick.color}
                />
            ))}
        </>
    );
}

const styles = {
    center: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)'
    } as any,
    btn: {
        backgroundColor: '#00d9ff',
        padding: 20,
        borderRadius: 10
    } as any,
    btnText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 20
    } as any
};
