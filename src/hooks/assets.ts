import { useEffect, useRef, useState, useCallback } from 'react';

// ============================================
// ASSET LOADING
// ============================================

interface AssetCache {
    images: Map<string, HTMLImageElement>;
    audio: Map<string, HTMLAudioElement>;
}

const assetCache: AssetCache = {
    images: new Map(),
    audio: new Map(),
};

/**
 * Load an image and cache it.
 */
async function loadImage(src: string): Promise<HTMLImageElement> {
    // Check cache
    const cached = assetCache.images.get(src);
    if (cached) return cached;

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            assetCache.images.set(src, img);
            resolve(img);
        };
        img.onerror = reject;
        img.src = src;
    });
}

/**
 * Load audio and cache it.
 */
async function loadAudio(src: string): Promise<HTMLAudioElement> {
    const cached = assetCache.audio.get(src);
    if (cached) return cached;

    return new Promise((resolve, reject) => {
        const audio = new Audio();
        audio.oncanplaythrough = () => {
            assetCache.audio.set(src, audio);
            resolve(audio);
        };
        audio.onerror = reject;
        audio.src = src;
    });
}

// ============================================
// USE ASSETS HOOK
// ============================================

export interface AssetManifest {
    images?: string[];
    audio?: string[];
}

export interface AssetsState {
    isLoading: boolean;
    isLoaded: boolean;
    progress: number;
    error: Error | null;
    images: Map<string, HTMLImageElement>;
    audio: Map<string, HTMLAudioElement>;
    getImage: (src: string) => HTMLImageElement | undefined;
    getAudio: (src: string) => HTMLAudioElement | undefined;
}

/**
 * Hook to preload game assets.
 * 
 * @example
 * ```tsx
 * function Game() {
 *   const assets = useAssets({
 *     images: ['/player.png', '/enemy.png', '/background.png'],
 *     audio: ['/jump.mp3', '/music.mp3'],
 *   });
 *   
 *   if (assets.isLoading) {
 *     return <LoadingScreen progress={assets.progress} />;
 *   }
 *   
 *   return <GameContent />;
 * }
 * ```
 */
export function useAssets(manifest: AssetManifest): AssetsState {
    const [isLoading, setIsLoading] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<Error | null>(null);

    const loadedImages = useRef(new Map<string, HTMLImageElement>());
    const loadedAudio = useRef(new Map<string, HTMLAudioElement>());

    useEffect(() => {
        let cancelled = false;

        async function loadAssets() {
            const allImages = manifest.images || [];
            const allAudio = manifest.audio || [];
            const total = allImages.length + allAudio.length;
            let loaded = 0;

            if (total === 0) {
                setIsLoading(false);
                setIsLoaded(true);
                setProgress(1);
                return;
            }

            try {
                // Load images
                for (const src of allImages) {
                    if (cancelled) return;
                    const img = await loadImage(src);
                    loadedImages.current.set(src, img);
                    loaded++;
                    setProgress(loaded / total);
                }

                // Load audio
                for (const src of allAudio) {
                    if (cancelled) return;
                    const audio = await loadAudio(src);
                    loadedAudio.current.set(src, audio);
                    loaded++;
                    setProgress(loaded / total);
                }

                if (!cancelled) {
                    setIsLoading(false);
                    setIsLoaded(true);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err as Error);
                    setIsLoading(false);
                }
            }
        }

        loadAssets();

        return () => {
            cancelled = true;
        };
    }, [manifest]);

    return {
        isLoading,
        isLoaded,
        progress,
        error,
        images: loadedImages.current,
        audio: loadedAudio.current,
        getImage: useCallback((src: string) => {
            return loadedImages.current.get(src) || assetCache.images.get(src);
        }, []),
        getAudio: useCallback((src: string) => {
            return loadedAudio.current.get(src) || assetCache.audio.get(src);
        }, []),
    };
}

// ============================================
// USE IMAGE HOOK
// ============================================

/**
 * Load a single image.
 * 
 * @example
 * ```tsx
 * const playerImage = useImage('/player.png');
 * 
 * if (!playerImage.loaded) return null;
 * 
 * return <Sprite src={playerImage.src} ... />;
 * ```
 */
export function useImage(src: string): {
    image: HTMLImageElement | null;
    loaded: boolean;
    error: Error | null;
} {
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        loadImage(src)
            .then(img => {
                setImage(img);
                setLoaded(true);
            })
            .catch(err => {
                setError(err);
            });
    }, [src]);

    return { image, loaded, error };
}

// ============================================
// USE AUDIO HOOK
// ============================================

export interface AudioControls {
    play: () => void;
    pause: () => void;
    stop: () => void;
    setVolume: (volume: number) => void;
    setLoop: (loop: boolean) => void;
    isPlaying: boolean;
    loaded: boolean;
}

/**
 * Load and control audio.
 * 
 * @example
 * ```tsx
 * const jumpSound = useAudio('/jump.mp3');
 * const music = useAudio('/music.mp3', { loop: true, volume: 0.3 });
 * 
 * // Play on jump
 * const jump = () => {
 *   jumpSound.play();
 *   player.vy = -500;
 * };
 * 
 * // Start music
 * useEffect(() => {
 *   if (music.loaded) music.play();
 * }, [music.loaded]);
 * ```
 */
export function useAudio(
    src: string,
    options?: { loop?: boolean; volume?: number; autoplay?: boolean }
): AudioControls {
    const { loop = false, volume = 1, autoplay = false } = options || {};

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        loadAudio(src).then(audio => {
            audioRef.current = audio.cloneNode() as HTMLAudioElement;
            audioRef.current.loop = loop;
            audioRef.current.volume = volume;
            setLoaded(true);

            if (autoplay) {
                audioRef.current.play().catch(() => { });
                setIsPlaying(true);
            }
        });

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [src, loop, volume, autoplay]);

    const play = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => { });
            setIsPlaying(true);
        }
    }, []);

    const pause = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    }, []);

    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
        }
    }, []);

    const setVolumeValue = useCallback((v: number) => {
        if (audioRef.current) {
            audioRef.current.volume = Math.max(0, Math.min(1, v));
        }
    }, []);

    const setLoopValue = useCallback((l: boolean) => {
        if (audioRef.current) {
            audioRef.current.loop = l;
        }
    }, []);

    return {
        play,
        pause,
        stop,
        setVolume: setVolumeValue,
        setLoop: setLoopValue,
        isPlaying,
        loaded,
    };
}
