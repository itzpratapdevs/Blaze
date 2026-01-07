import { useRef, useCallback, useEffect, useState } from 'react';
import { Game, GameConfig } from '../core/Game';

/**
 * Hook to create and manage a game instance.
 *
 * @example
 * ```tsx
 * function MyGame() {
 *   const { game, isRunning, start, stop, pause, resume } = useGame({
 *     width: 360,
 *     height: 640,
 *     backgroundColor: '#1a1a2e',
 *   });
 *
 *   return <BlazeCanvas game={game} style={{ flex: 1 }} />;
 * }
 * ```
 */
export function useGame(config: GameConfig) {
    const gameRef = useRef<Game | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // Create game instance once
    if (!gameRef.current) {
        gameRef.current = new Game(config);
    }

    const game = gameRef.current;

    const start = useCallback(() => {
        game.start();
        setIsRunning(true);
        setIsPaused(false);
    }, [game]);

    const stop = useCallback(() => {
        game.stop();
        setIsRunning(false);
        setIsPaused(false);
    }, [game]);

    const pause = useCallback(() => {
        game.pause();
        setIsPaused(true);
    }, [game]);

    const resume = useCallback(() => {
        game.resume();
        setIsPaused(false);
    }, [game]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            game.stop();
        };
    }, [game]);

    return {
        game,
        isRunning,
        isPaused,
        start,
        stop,
        pause,
        resume,
    };
}

/**
 * Hook to access game state.
 */
export function useGameState(game: Game | null) {
    const [width, setWidth] = useState(game?.width ?? 0);
    const [height, setHeight] = useState(game?.height ?? 0);

    useEffect(() => {
        if (game) {
            setWidth(game.width);
            setHeight(game.height);
        }
    }, [game]);

    return { width, height };
}
