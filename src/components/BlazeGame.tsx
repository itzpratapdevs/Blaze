import React, { createContext, useContext, useRef, useCallback, useEffect, useState, useMemo } from 'react';

// ============================================
// TYPES
// ============================================

export interface GameConfig {
    /** Game width in pixels */
    width: number;
    /** Game height in pixels */
    height: number;
    /** Background color (CSS color) */
    backgroundColor?: string;
    /** Target FPS (default: 60) */
    targetFPS?: number;
    /** Enable debug mode */
    debug?: boolean;
}

export interface GameState {
    width: number;
    height: number;
    backgroundColor: string;
    isPaused: boolean;
    isRunning: boolean;
    debug: boolean;
    /** Time since last frame in seconds */
    deltaTime: number;
    /** Total elapsed time in seconds */
    elapsedTime: number;
    /** Current FPS */
    fps: number;
}

export interface GameContextValue extends GameState {
    /** Pause the game loop */
    pause: () => void;
    /** Resume the game loop */
    resume: () => void;
    /** Canvas ref for rendering */
    canvasRef: React.RefObject<HTMLCanvasElement>;
    /** 2D rendering context */
    ctx: CanvasRenderingContext2D | null;
    /** Register a game loop callback */
    onUpdate: (callback: (dt: number) => void) => () => void;
    /** Register a fixed update callback (physics) */
    onFixedUpdate: (callback: (dt: number) => void) => () => void;
}

// ============================================
// CONTEXT
// ============================================

const GameContext = createContext<GameContextValue | null>(null);

/**
 * Hook to access game state and controls.
 * Must be used within a <BlazeGame> component.
 */
export function useGame(): GameContextValue {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a <BlazeGame> component');
    }
    return context;
}

// ============================================
// BLAZE GAME COMPONENT
// ============================================

export interface BlazeGameProps extends GameConfig {
    /** Game content - use any React components! */
    children?: React.ReactNode;
    /** Custom styles for the canvas container */
    style?: React.CSSProperties;
    /** Custom className for the canvas container */
    className?: string;
}

/**
 * Root game component. Wrap your game content with this.
 * 
 * @example
 * ```tsx
 * <BlazeGame width={800} height={600}>
 *   <Player />
 *   <Enemies />
 *   <UI />
 * </BlazeGame>
 * ```
 */
export function BlazeGame({
    width,
    height,
    backgroundColor = '#000000',
    targetFPS = 60,
    debug = false,
    children,
    style,
    className,
}: BlazeGameProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [deltaTime, setDeltaTime] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [fps, setFps] = useState(0);

    // Callback refs
    const updateCallbacks = useRef<Set<(dt: number) => void>>(new Set());
    const fixedUpdateCallbacks = useRef<Set<(dt: number) => void>>(new Set());
    const lastTimeRef = useRef(0);
    const accumulatorRef = useRef(0);
    const fpsCounterRef = useRef({ frames: 0, lastTime: 0 });

    const fixedDeltaTime = 1 / 60; // Fixed timestep for physics

    // Initialize canvas context
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const context = canvas.getContext('2d');
            setCtx(context);
            setIsRunning(true);
        }
    }, []);

    // Game loop
    useEffect(() => {
        if (!ctx || !isRunning) return;

        let animationId: number;

        const gameLoop = (currentTime: number) => {
            if (isPaused) {
                lastTimeRef.current = currentTime;
                animationId = requestAnimationFrame(gameLoop);
                return;
            }

            // Calculate delta time
            const dt = Math.min((currentTime - lastTimeRef.current) / 1000, 0.1);
            lastTimeRef.current = currentTime;

            // Update FPS counter
            fpsCounterRef.current.frames++;
            if (currentTime - fpsCounterRef.current.lastTime >= 1000) {
                setFps(fpsCounterRef.current.frames);
                fpsCounterRef.current.frames = 0;
                fpsCounterRef.current.lastTime = currentTime;
            }

            // Fixed update (physics)
            accumulatorRef.current += dt;
            while (accumulatorRef.current >= fixedDeltaTime) {
                fixedUpdateCallbacks.current.forEach(cb => cb(fixedDeltaTime));
                accumulatorRef.current -= fixedDeltaTime;
            }

            // Variable update
            updateCallbacks.current.forEach(cb => cb(dt));

            // Update state
            setDeltaTime(dt);
            setElapsedTime(prev => prev + dt);

            // Clear and render
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, width, height);

            animationId = requestAnimationFrame(gameLoop);
        };

        lastTimeRef.current = performance.now();
        animationId = requestAnimationFrame(gameLoop);

        return () => cancelAnimationFrame(animationId);
    }, [ctx, isRunning, isPaused, backgroundColor, width, height]);

    // Control functions
    const pause = useCallback(() => setIsPaused(true), []);
    const resume = useCallback(() => setIsPaused(false), []);

    const onUpdate = useCallback((callback: (dt: number) => void) => {
        updateCallbacks.current.add(callback);
        return () => {
            updateCallbacks.current.delete(callback);
        };
    }, []);

    const onFixedUpdate = useCallback((callback: (dt: number) => void) => {
        fixedUpdateCallbacks.current.add(callback);
        return () => {
            fixedUpdateCallbacks.current.delete(callback);
        };
    }, []);

    // Context value
    const contextValue = useMemo<GameContextValue>(() => ({
        width,
        height,
        backgroundColor,
        isPaused,
        isRunning,
        debug,
        deltaTime,
        elapsedTime,
        fps,
        pause,
        resume,
        canvasRef,
        ctx,
        onUpdate,
        onFixedUpdate,
    }), [width, height, backgroundColor, isPaused, isRunning, debug, deltaTime, elapsedTime, fps, ctx, pause, resume, onUpdate, onFixedUpdate]);

    return (
        <GameContext.Provider value={contextValue}>
            <div
                style={{
                    position: 'relative',
                    width,
                    height,
                    overflow: 'hidden',
                    ...style,
                }}
                className={className}
            >
                {/* Game Canvas */}
                <canvas
                    ref={canvasRef}
                    width={width}
                    height={height}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        display: 'block',
                    }}
                />

                {/* React Children (UI, overlays, etc.) */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                    }}
                >
                    {children}
                </div>

                {/* Debug overlay */}
                {debug && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            color: '#00ff00',
                            fontFamily: 'monospace',
                            fontSize: 12,
                            pointerEvents: 'none',
                        }}
                    >
                        <div>FPS: {fps}</div>
                        <div>Delta: {deltaTime.toFixed(4)}</div>
                        <div>Time: {elapsedTime.toFixed(2)}</div>
                    </div>
                )}
            </div>
        </GameContext.Provider>
    );
}

export default BlazeGame;
