import React, { useRef, useEffect, useState, useCallback, createContext, useContext, useMemo } from 'react';
import { useGame } from './BlazeGame';

// ============================================
// TILEMAP COMPONENT
// ============================================

export interface TilemapProps {
    /** Tile size in pixels */
    tileSize: number;
    /** 2D array of tile indices */
    data: number[][];
    /** Map of tile index to image source (0 = empty) */
    tiles: Record<number, string | null>;
    /** X offset */
    x?: number;
    /** Y offset */
    y?: number;
    /** Opacity */
    opacity?: number;
    /** Called when tile is clicked */
    onTileClick?: (tileX: number, tileY: number, value: number) => void;
}

interface TileImage {
    index: number;
    image: HTMLImageElement;
}

/**
 * Tilemap component for grid-based levels.
 * 
 * @example
 * ```tsx
 * <Tilemap
 *   tileSize={32}
 *   data={[
 *     [1, 1, 1, 1, 1],
 *     [1, 0, 0, 0, 1],
 *     [1, 0, 2, 0, 1],
 *     [1, 1, 1, 1, 1],
 *   ]}
 *   tiles={{
 *     0: null,           // Empty
 *     1: '/wall.png',    // Wall
 *     2: '/coin.png',    // Coin
 *   }}
 * />
 * ```
 */
export function Tilemap({
    tileSize,
    data,
    tiles,
    x = 0,
    y = 0,
    opacity = 1,
    onTileClick,
}: TilemapProps) {
    const { ctx, canvasRef, onUpdate } = useGame();
    const tileImages = useRef<Map<number, HTMLImageElement>>(new Map());
    const [loaded, setLoaded] = useState(false);

    // Load tile images
    useEffect(() => {
        const loadPromises: Promise<void>[] = [];

        Object.entries(tiles).forEach(([index, src]) => {
            if (src === null) return;

            const promise = new Promise<void>((resolve) => {
                const img = new Image();
                img.onload = () => {
                    tileImages.current.set(parseInt(index), img);
                    resolve();
                };
                img.onerror = () => resolve();
                img.src = src;
            });
            loadPromises.push(promise);
        });

        Promise.all(loadPromises).then(() => setLoaded(true));
    }, [tiles]);

    // Handle clicks
    useEffect(() => {
        if (!onTileClick) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleClick = (e: PointerEvent) => {
            const rect = canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left - x;
            const clickY = e.clientY - rect.top - y;

            const tileX = Math.floor(clickX / tileSize);
            const tileY = Math.floor(clickY / tileSize);

            if (tileY >= 0 && tileY < data.length && tileX >= 0 && tileX < data[tileY].length) {
                onTileClick(tileX, tileY, data[tileY][tileX]);
            }
        };

        canvas.addEventListener('pointerdown', handleClick);
        return () => canvas.removeEventListener('pointerdown', handleClick);
    }, [canvasRef, onTileClick, data, tileSize, x, y]);

    // Render
    useEffect(() => {
        if (!ctx || !loaded) return;

        return onUpdate(() => {
            ctx.save();
            ctx.globalAlpha = opacity;

            for (let row = 0; row < data.length; row++) {
                for (let col = 0; col < data[row].length; col++) {
                    const tileIndex = data[row][col];
                    const image = tileImages.current.get(tileIndex);

                    if (image) {
                        ctx.drawImage(
                            image,
                            x + col * tileSize,
                            y + row * tileSize,
                            tileSize,
                            tileSize
                        );
                    }
                }
            }

            ctx.restore();
        });
    }, [ctx, onUpdate, data, tileSize, x, y, opacity, loaded]);

    return null;
}

// ============================================
// TILEMAP HOOK
// ============================================

export interface TilemapRef {
    /** Get tile value at position */
    getTile: (tileX: number, tileY: number) => number | undefined;
    /** Set tile value at position */
    setTile: (tileX: number, tileY: number, value: number) => void;
    /** Convert world coordinates to tile coordinates */
    worldToTile: (worldX: number, worldY: number) => { x: number; y: number };
    /** Convert tile coordinates to world coordinates (center of tile) */
    tileToWorld: (tileX: number, tileY: number) => { x: number; y: number };
    /** Check if tile is solid (non-zero) */
    isSolid: (tileX: number, tileY: number) => boolean;
    /** Get tilemap data */
    getData: () => number[][];
}

/**
 * Hook for tilemap manipulation.
 * 
 * @example
 * ```tsx
 * const [mapData, setMapData] = useState(initialMap);
 * const tilemap = useTilemap(mapData, setMapData, 32);
 * 
 * // Check collision
 * const tile = tilemap.worldToTile(player.x, player.y);
 * if (tilemap.isSolid(tile.x, tile.y)) {
 *   // Collision!
 * }
 * ```
 */
export function useTilemap(
    data: number[][],
    setData: (data: number[][]) => void,
    tileSize: number,
    offsetX = 0,
    offsetY = 0
): TilemapRef {
    const getTile = useCallback((tileX: number, tileY: number) => {
        if (tileY >= 0 && tileY < data.length && tileX >= 0 && tileX < data[tileY].length) {
            return data[tileY][tileX];
        }
        return undefined;
    }, [data]);

    const setTile = useCallback((tileX: number, tileY: number, value: number) => {
        if (tileY >= 0 && tileY < data.length && tileX >= 0 && tileX < data[tileY].length) {
            const newData = data.map((row, y) =>
                y === tileY ? row.map((v, x) => (x === tileX ? value : v)) : row
            );
            setData(newData);
        }
    }, [data, setData]);

    const worldToTile = useCallback((worldX: number, worldY: number) => ({
        x: Math.floor((worldX - offsetX) / tileSize),
        y: Math.floor((worldY - offsetY) / tileSize),
    }), [tileSize, offsetX, offsetY]);

    const tileToWorld = useCallback((tileX: number, tileY: number) => ({
        x: offsetX + tileX * tileSize + tileSize / 2,
        y: offsetY + tileY * tileSize + tileSize / 2,
    }), [tileSize, offsetX, offsetY]);

    const isSolid = useCallback((tileX: number, tileY: number) => {
        const tile = getTile(tileX, tileY);
        return tile !== undefined && tile !== 0;
    }, [getTile]);

    const getData = useCallback(() => data, [data]);

    return {
        getTile,
        setTile,
        worldToTile,
        tileToWorld,
        isSolid,
        getData,
    };
}

// ============================================
// SCENE MANAGER
// ============================================

interface SceneContextValue {
    currentScene: string;
    setScene: (name: string) => void;
    sceneData: any;
    setSceneData: (data: any) => void;
}

const SceneContext = createContext<SceneContextValue | null>(null);

export interface SceneManagerProps {
    /** Initial scene name */
    initialScene: string;
    /** Scene components */
    children: React.ReactNode;
}

/**
 * Scene manager for multi-screen games.
 * 
 * @example
 * ```tsx
 * <SceneManager initialScene="menu">
 *   <Scene name="menu">
 *     <MenuScreen />
 *   </Scene>
 *   <Scene name="game">
 *     <GameScreen />
 *   </Scene>
 *   <Scene name="gameover">
 *     <GameOverScreen />
 *   </Scene>
 * </SceneManager>
 * ```
 */
export function SceneManager({ initialScene, children }: SceneManagerProps) {
    const [currentScene, setCurrentScene] = useState(initialScene);
    const [sceneData, setSceneData] = useState<any>(null);

    const contextValue = useMemo<SceneContextValue>(() => ({
        currentScene,
        setScene: setCurrentScene,
        sceneData,
        setSceneData,
    }), [currentScene, sceneData]);

    return (
        <SceneContext.Provider value={contextValue}>
            {children}
        </SceneContext.Provider>
    );
}

export interface SceneProps {
    /** Scene name */
    name: string;
    /** Scene content */
    children: React.ReactNode;
}

/**
 * Scene component (used inside SceneManager).
 */
export function Scene({ name, children }: SceneProps) {
    const context = useContext(SceneContext);

    if (!context || context.currentScene !== name) {
        return null;
    }

    return <>{children}</>;
}

/**
 * Hook to access scene management.
 */
export function useSceneManager() {
    const context = useContext(SceneContext);
    if (!context) {
        throw new Error('useSceneManager must be used within a <SceneManager>');
    }
    return context;
}

// ============================================
// RIGIDBODY COMPONENT
// ============================================

export interface RigidbodyProps {
    /** Initial X position */
    x: number;
    /** Initial Y position */
    y: number;
    /** Initial X velocity */
    velocityX?: number;
    /** Initial Y velocity */
    velocityY?: number;
    /** Gravity (pixels per second^2) */
    gravity?: number;
    /** Drag/air resistance (0-1) */
    drag?: number;
    /** Bounciness (0-1) */
    bounce?: number;
    /** Mass (affects forces) */
    mass?: number;
    /** Is kinematic (no physics simulation) */
    kinematic?: boolean;
    /** Called each frame with body state */
    onUpdate?: (body: RigidbodyState) => void;
    /** Children to render at body position */
    children?: React.ReactNode;
}

export interface RigidbodyState {
    x: number;
    y: number;
    velocityX: number;
    velocityY: number;
    /** Apply force (affected by mass) */
    applyForce: (fx: number, fy: number) => void;
    /** Apply impulse (instant velocity change) */
    applyImpulse: (ix: number, iy: number) => void;
    /** Set velocity directly */
    setVelocity: (vx: number, vy: number) => void;
    /** Set position directly */
    setPosition: (x: number, y: number) => void;
}

const RigidbodyContext = createContext<RigidbodyState | null>(null);

/**
 * Hook to access parent rigidbody state.
 */
export function useRigidbody(): RigidbodyState | null {
    return useContext(RigidbodyContext);
}

/**
 * Rigidbody component for physics simulation.
 * 
 * @example
 * ```tsx
 * <Rigidbody x={100} y={100} gravity={800}>
 *   <Sprite src="/ball.png" x={0} y={0} />
 * </Rigidbody>
 * ```
 */
export function Rigidbody({
    x: initialX,
    y: initialY,
    velocityX = 0,
    velocityY = 0,
    gravity = 0,
    drag = 0,
    bounce = 0,
    mass = 1,
    kinematic = false,
    onUpdate,
    children,
}: RigidbodyProps) {
    const { onUpdate: registerUpdate } = useGame();

    const stateRef = useRef({
        x: initialX,
        y: initialY,
        velocityX,
        velocityY,
        forceX: 0,
        forceY: 0,
    });

    const [, forceRender] = useState({});

    // Physics update
    useEffect(() => {
        if (kinematic) return;

        return registerUpdate((dt) => {
            const s = stateRef.current;

            // Apply gravity
            s.velocityY += gravity * dt;

            // Apply accumulated forces
            s.velocityX += (s.forceX / mass) * dt;
            s.velocityY += (s.forceY / mass) * dt;
            s.forceX = 0;
            s.forceY = 0;

            // Apply drag
            if (drag > 0) {
                s.velocityX *= (1 - drag);
                s.velocityY *= (1 - drag);
            }

            // Update position
            s.x += s.velocityX * dt;
            s.y += s.velocityY * dt;

            // Trigger update callback
            onUpdate?.(bodyState);
        });
    }, [registerUpdate, gravity, drag, mass, kinematic, onUpdate]);

    // Body state object
    const bodyState = useMemo<RigidbodyState>(() => ({
        get x() { return stateRef.current.x; },
        get y() { return stateRef.current.y; },
        get velocityX() { return stateRef.current.velocityX; },
        get velocityY() { return stateRef.current.velocityY; },
        applyForce: (fx: number, fy: number) => {
            stateRef.current.forceX += fx;
            stateRef.current.forceY += fy;
        },
        applyImpulse: (ix: number, iy: number) => {
            stateRef.current.velocityX += ix / mass;
            stateRef.current.velocityY += iy / mass;
        },
        setVelocity: (vx: number, vy: number) => {
            stateRef.current.velocityX = vx;
            stateRef.current.velocityY = vy;
        },
        setPosition: (x: number, y: number) => {
            stateRef.current.x = x;
            stateRef.current.y = y;
        },
    }), [mass]);

    return (
        <RigidbodyContext.Provider value={bodyState}>
            {children}
        </RigidbodyContext.Provider>
    );
}

export default Tilemap;
