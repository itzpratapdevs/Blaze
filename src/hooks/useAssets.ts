import { useState, useCallback, useEffect } from 'react';
import { AssetLoader } from '../assets/AssetLoader';

/**
 * Asset loading state.
 */
export interface AssetLoadingState {
    isLoading: boolean;
    progress: number;
    loaded: number;
    total: number;
    error: Error | null;
}

/**
 * Hook to load and cache game assets.
 *
 * @example
 * ```tsx
 * function GameLoader({ onReady }) {
 *   const { isLoading, progress, loadImages, getImage } = useAssets();
 *
 *   useEffect(() => {
 *     loadImages(['player.png', 'enemy.png', 'bg.png']).then(onReady);
 *   }, []);
 *
 *   if (isLoading) {
 *     return <LoadingBar progress={progress} />;
 *   }
 *
 *   return null;
 * }
 * ```
 */
export function useAssets() {
    const [state, setState] = useState<AssetLoadingState>({
        isLoading: false,
        progress: 0,
        loaded: 0,
        total: 0,
        error: null,
    });

    const loadImages = useCallback(async (paths: string[]) => {
        setState({
            isLoading: true,
            progress: 0,
            loaded: 0,
            total: paths.length,
            error: null,
        });

        try {
            // Set progress callback
            AssetLoader.onProgress = (loaded: number, total: number) => {
                setState(prev => ({
                    ...prev,
                    loaded,
                    total,
                    progress: total > 0 ? loaded / total : 0,
                }));
            };

            await AssetLoader.loadImages(paths);

            setState(prev => ({
                ...prev,
                isLoading: false,
                progress: 1,
            }));

            AssetLoader.onProgress = null;
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error as Error,
            }));
            AssetLoader.onProgress = null;
        }
    }, []);

    const loadImage = useCallback(async (name: string, path: string) => {
        return AssetLoader.loadImage(name, path);
    }, []);

    const getImage = useCallback((name: string) => {
        return AssetLoader.getImage(name);
    }, []);

    const isLoaded = useCallback((name: string): boolean => {
        return AssetLoader.isLoaded(name);
    }, []);

    const remove = useCallback((name: string) => {
        AssetLoader.remove(name);
    }, []);

    const clear = useCallback(() => {
        AssetLoader.clear();
    }, []);

    return {
        ...state,
        loadImages,
        loadImage,
        getImage,
        isLoaded,
        remove,
        clear,
    };
}

/**
 * Hook to preload a single image.
 */
export function useImage(name: string, path: string) {
    const [image, setImage] = useState<ReturnType<typeof AssetLoader.getImage>>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let mounted = true;

        setIsLoading(true);
        setError(null);

        AssetLoader.loadImage(name, path)
            .then((img) => {
                if (mounted) {
                    setImage(img ?? undefined);
                    setIsLoading(false);
                }
            })
            .catch((err) => {
                if (mounted) {
                    setError(err);
                    setIsLoading(false);
                }
            });

        return () => {
            mounted = false;
        };
    }, [name, path]);

    return { image, isLoading, error };
}
