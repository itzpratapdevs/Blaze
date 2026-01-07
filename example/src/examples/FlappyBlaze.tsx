import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import {
    BlazeCanvas,
    useGame,
    useGameLoop,
    useTouch,
    useCollision,
    SpriteComponent as Sprite,
    ColliderComponent as Collider,
    ColliderProvider,
    SpriteProvider,
    CollisionLayers,
} from 'blaze-engine';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const GRAVITY = 1000;
const JUMP_FORCE = -400;
const SCROLL_SPEED = 150;
const PIPE_GAP = 140;
const PIPE_WIDTH = 60;
const SPAWN_RATE = 2.5;

export function FlappyBlaze() {
    const { game, isRunning, start, stop } = useGame({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        backgroundColor: '#70c5ce', // Sky blue
    });

    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    return (
        <View style={{ flex: 1 }}>
            <ColliderProvider>
                <SpriteProvider>
                    <BlazeCanvas game={game} style={{ flex: 1 }}>
                        {isRunning && !gameOver && (
                            <GameWorld
                                score={score}
                                setScore={setScore}
                                onGameOver={() => setGameOver(true)}
                            />
                        )}
                        {gameOver && <GameOver score={score} onRestart={() => {
                            setGameOver(false);
                            setScore(0);
                        }} />}
                    </BlazeCanvas>
                </SpriteProvider>
            </ColliderProvider>

            {!isRunning && !gameOver && (
                <View style={styles.overlay}>
                    <Text style={styles.title}>Flappy Blaze</Text>
                    <TouchableOpacity style={styles.button} onPress={start}>
                        <Text style={styles.btnText}>PLAY</Text>
                    </TouchableOpacity>
                </View>
            )}

            {gameOver && (
                <View style={styles.overlay}>
                    <Text style={styles.title}>Game Over</Text>
                    <Text style={styles.scoreText}>Score: {score}</Text>
                    <TouchableOpacity style={styles.button} onPress={() => {
                        setGameOver(false);
                        setScore(0);
                    }}>
                        <Text style={styles.btnText}>RESTART</Text>
                    </TouchableOpacity>
                </View>
            )}

            {isRunning && !gameOver && (
                <Text style={styles.inGameScore}>{score}</Text>
            )}
        </View>
    );
}

function GameWorld({ score, setScore, onGameOver }: any) {
    const [birdY, setBirdY] = useState(SCREEN_HEIGHT / 2);
    const velocityRef = useRef(0);
    const { handlers } = useTouch();

    // Bird physics
    useGameLoop((dt) => {
        velocityRef.current += GRAVITY * dt;
        setBirdY((y) => Math.min(SCREEN_HEIGHT - 30, Math.max(0, y + velocityRef.current * dt)));

        if (birdY >= SCREEN_HEIGHT - 30) {
            onGameOver();
        }
    });

    // Jump handler
    const jump = () => {
        velocityRef.current = JUMP_FORCE;
    };

    return (
        <>
            {/* Input layer (invisible full screen button) */}
            <Sprite
                x={0}
                y={0}
                width={SCREEN_WIDTH}
                height={SCREEN_HEIGHT}
                visible={false}
                zIndex={100}
            >
                {/* We can't attach handlers directly to Sprite yet, so we rely on screen touch for now 
            or implementing a touch handler component. For this example, we'll use useTouch 
            in a way that assumes screen-wide taps.
         */}
            </Sprite>

            {/* Bird */}
            <Collider
                id="bird"
                x={50}
                y={birdY}
                width={40}
                height={40}
                layer={CollisionLayers.Player}
                mask={CollisionLayers.Enemy}
                onEnter={() => onGameOver()}
            >
                <Sprite
                    x={50}
                    y={birdY}
                    width={40}
                    height={40}
                    tint="#f4d03f"
                    anchorX={0.5}
                    anchorY={0.5}
                    rotation={Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (velocityRef.current * 0.002)))}
                />
            </Collider>

            {/* Pipe Spawner */}
            <PipeManager
                speed={SCROLL_SPEED}
                onScore={() => setScore((s: number) => s + 1)}
            />

            {/* Ground (visual only) */}
            <Sprite
                x={0}
                y={SCREEN_HEIGHT - 20}
                width={SCREEN_WIDTH}
                height={20}
                tint="#ded895"
            />
        </>
    );
}

function PipeManager({ speed, onScore }: any) {
    const [pipes, setPipes] = useState<any[]>([]);
    const timeRef = useRef(0);

    useGameLoop((dt) => {
        // Spawn
        timeRef.current += dt;
        if (timeRef.current >= SPAWN_RATE) {
            timeRef.current = 0;
            const holeY = 100 + Math.random() * (SCREEN_HEIGHT - 300);
            const id = Date.now().toString();
            setPipes((prev) => [
                ...prev,
                { id, x: SCREEN_WIDTH, holeY, scored: false },
            ]);
        }

        // Move & Cleanup
        setPipes((prev) =>
            prev
                .map((pipe) => ({ ...pipe, x: pipe.x - speed * dt }))
                .filter((pipe) => pipe.x > -PIPE_WIDTH)
        );

        // Score
        setPipes((prev) =>
            prev.map(p => {
                if (!p.scored && p.x < 50) {
                    onScore();
                    return { ...p, scored: true };
                }
                return p;
            })
        );
    });

    return (
        <>
            {pipes.map((pipe) => (
                <React.Fragment key={pipe.id}>
                    {/* Top Pipe */}
                    <Collider
                        id={`top-${pipe.id}`}
                        x={pipe.x}
                        y={0}
                        width={PIPE_WIDTH}
                        height={pipe.holeY}
                        layer={CollisionLayers.Enemy}
                    >
                        <Sprite
                            x={pipe.x}
                            y={0}
                            width={PIPE_WIDTH}
                            height={pipe.holeY}
                            tint="#73bf2e"
                        />
                    </Collider>

                    {/* Bottom Pipe */}
                    <Collider
                        id={`bot-${pipe.id}`}
                        x={pipe.x}
                        y={pipe.holeY + PIPE_GAP}
                        width={PIPE_WIDTH}
                        height={SCREEN_HEIGHT - (pipe.holeY + PIPE_GAP)}
                        layer={CollisionLayers.Enemy}
                    >
                        <Sprite
                            x={pipe.x}
                            y={pipe.holeY + PIPE_GAP}
                            width={PIPE_WIDTH}
                            height={SCREEN_HEIGHT - (pipe.holeY + PIPE_GAP)}
                            tint="#73bf2e"
                        />
                    </Collider>
                </React.Fragment>
            ))}
        </>
    );
}

function GameOver({ score, onRestart }: any) {
    return null; // Rendered via React Native UI overlay
}

const styles = {
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    } as any,
    title: {
        fontSize: 40,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 20,
    } as any,
    scoreText: {
        fontSize: 24,
        color: 'white',
        marginBottom: 20,
    } as any,
    inGameScore: {
        position: 'absolute',
        top: 50,
        alignSelf: 'center',
        fontSize: 60,
        fontWeight: 'bold',
        color: 'white',
        textShadowColor: 'black',
        textShadowRadius: 10,
    } as any,
    button: {
        backgroundColor: '#f4d03f',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 30,
        borderWidth: 4,
        borderColor: 'white',
    } as any,
    btnText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    } as any,
};

import { StyleSheet } from 'react-native';
