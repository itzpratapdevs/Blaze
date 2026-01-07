/**
 * Sound playback options.
 */
export interface SoundOptions {
    /**
     * Volume (0-1).
     */
    volume?: number;

    /**
     * Playback rate (1 = normal speed).
     */
    rate?: number;

    /**
     * Loop the sound.
     */
    loop?: boolean;
}

/**
 * Music playback options.
 */
export interface MusicOptions {
    /**
     * Volume (0-1).
     */
    volume?: number;

    /**
     * Loop the music.
     */
    loop?: boolean;

    /**
     * Fade in duration in seconds.
     */
    fadeIn?: number;

    /**
     * Fade out duration in seconds.
     */
    fadeOut?: number;
}

/**
 * Audio instance.
 */
interface AudioInstance {
    source: any; // expo-av Audio.Sound or similar
    volume: number;
    isPlaying: boolean;
    isLoaded: boolean;
}

/**
 * AudioManager for game audio.
 *
 * Uses expo-av for audio playback. Provides a simple API
 * for sound effects and background music.
 *
 * @example
 * ```typescript
 * // Load audio
 * await AudioManager.loadSound('jump', require('./sounds/jump.mp3'));
 * await AudioManager.loadMusic('bgm', require('./sounds/background.mp3'));
 *
 * // Play
 * AudioManager.playSound('jump');
 * AudioManager.playMusic('bgm', { loop: true, fadeIn: 1 });
 *
 * // Control
 * AudioManager.setMasterVolume(0.8);
 * AudioManager.pauseMusic();
 * ```
 */
export class AudioManager {
    // Audio cache
    private static _sounds: Map<string, AudioInstance> = new Map();
    private static _music: Map<string, AudioInstance> = new Map();
    private static _currentMusic: string | null = null;

    // Volume levels
    private static _masterVolume: number = 1;
    private static _soundVolume: number = 1;
    private static _musicVolume: number = 1;
    private static _muted: boolean = false;

    // expo-av reference (set dynamically to avoid hard dependency)
    private static _Audio: any = null;

    /**
     * Initialize the audio manager with expo-av Audio module.
     * Call this before loading any audio.
     *
     * @example
     * ```typescript
     * import { Audio } from 'expo-av';
     * AudioManager.init(Audio);
     * ```
     */
    static init(Audio: any): void {
        AudioManager._Audio = Audio;

        // Configure audio mode for games
        Audio.setAudioModeAsync?.({
            allowsRecordingIOS: false,
            staysActiveInBackground: false,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
        }).catch(() => {
            // Ignore errors on unsupported platforms
        });
    }

    // ===============================
    // Loading
    // ===============================

    /**
     * Load a sound effect.
     */
    static async loadSound(name: string, source: any): Promise<void> {
        if (!AudioManager._Audio) {
            console.warn('AudioManager: Not initialized. Call AudioManager.init(Audio) first.');
            return;
        }

        try {
            const { sound } = await AudioManager._Audio.Sound.createAsync(source);

            AudioManager._sounds.set(name, {
                source: sound,
                volume: 1,
                isPlaying: false,
                isLoaded: true,
            });
        } catch (e) {
            console.error(`AudioManager: Failed to load sound '${name}'`, e);
        }
    }

    /**
     * Load background music.
     */
    static async loadMusic(name: string, source: any): Promise<void> {
        if (!AudioManager._Audio) {
            console.warn('AudioManager: Not initialized. Call AudioManager.init(Audio) first.');
            return;
        }

        try {
            const { sound } = await AudioManager._Audio.Sound.createAsync(source);

            AudioManager._music.set(name, {
                source: sound,
                volume: 1,
                isPlaying: false,
                isLoaded: true,
            });
        } catch (e) {
            console.error(`AudioManager: Failed to load music '${name}'`, e);
        }
    }

    /**
     * Check if a sound is loaded.
     */
    static isSoundLoaded(name: string): boolean {
        return AudioManager._sounds.has(name);
    }

    /**
     * Check if music is loaded.
     */
    static isMusicLoaded(name: string): boolean {
        return AudioManager._music.has(name);
    }

    // ===============================
    // Sound Effects
    // ===============================

    /**
     * Play a sound effect.
     */
    static async playSound(name: string, options: SoundOptions = {}): Promise<void> {
        if (AudioManager._muted) return;

        const audio = AudioManager._sounds.get(name);
        if (!audio || !audio.isLoaded) {
            console.warn(`AudioManager: Sound '${name}' not found`);
            return;
        }

        try {
            const volume = (options.volume ?? 1) * AudioManager._soundVolume * AudioManager._masterVolume;

            await audio.source.setVolumeAsync(volume);

            if (options.rate !== undefined) {
                await audio.source.setRateAsync(options.rate, true);
            }

            if (options.loop !== undefined) {
                await audio.source.setIsLoopingAsync(options.loop);
            }

            // Rewind and play
            await audio.source.setPositionAsync(0);
            await audio.source.playAsync();
            audio.isPlaying = true;
        } catch (e) {
            console.error(`AudioManager: Failed to play sound '${name}'`, e);
        }
    }

    /**
     * Stop a sound effect.
     */
    static async stopSound(name: string): Promise<void> {
        const audio = AudioManager._sounds.get(name);
        if (!audio) return;

        try {
            await audio.source.stopAsync();
            audio.isPlaying = false;
        } catch (e) {
            // Ignore
        }
    }

    // ===============================
    // Music
    // ===============================

    /**
     * Play background music.
     */
    static async playMusic(name: string, options: MusicOptions = {}): Promise<void> {
        if (AudioManager._muted) return;

        // Stop current music if different
        if (AudioManager._currentMusic && AudioManager._currentMusic !== name) {
            await AudioManager.stopMusic(options.fadeOut);
        }

        const audio = AudioManager._music.get(name);
        if (!audio || !audio.isLoaded) {
            console.warn(`AudioManager: Music '${name}' not found`);
            return;
        }

        try {
            const targetVolume = (options.volume ?? 1) * AudioManager._musicVolume * AudioManager._masterVolume;

            // Set initial volume (0 if fading in)
            await audio.source.setVolumeAsync(options.fadeIn ? 0 : targetVolume);
            await audio.source.setIsLoopingAsync(options.loop ?? true);

            // Rewind and play
            await audio.source.setPositionAsync(0);
            await audio.source.playAsync();
            audio.isPlaying = true;
            audio.volume = targetVolume;
            AudioManager._currentMusic = name;

            // Fade in
            if (options.fadeIn && options.fadeIn > 0) {
                AudioManager._fadeVolume(audio, 0, targetVolume, options.fadeIn);
            }
        } catch (e) {
            console.error(`AudioManager: Failed to play music '${name}'`, e);
        }
    }

    /**
     * Pause current music.
     */
    static async pauseMusic(): Promise<void> {
        if (!AudioManager._currentMusic) return;

        const audio = AudioManager._music.get(AudioManager._currentMusic);
        if (!audio) return;

        try {
            await audio.source.pauseAsync();
            audio.isPlaying = false;
        } catch (e) {
            // Ignore
        }
    }

    /**
     * Resume current music.
     */
    static async resumeMusic(): Promise<void> {
        if (!AudioManager._currentMusic) return;

        const audio = AudioManager._music.get(AudioManager._currentMusic);
        if (!audio) return;

        try {
            await audio.source.playAsync();
            audio.isPlaying = true;
        } catch (e) {
            // Ignore
        }
    }

    /**
     * Stop current music.
     */
    static async stopMusic(fadeOut?: number): Promise<void> {
        if (!AudioManager._currentMusic) return;

        const audio = AudioManager._music.get(AudioManager._currentMusic);
        if (!audio) return;

        try {
            if (fadeOut && fadeOut > 0) {
                await AudioManager._fadeVolume(audio, audio.volume, 0, fadeOut);
            }

            await audio.source.stopAsync();
            audio.isPlaying = false;
            AudioManager._currentMusic = null;
        } catch (e) {
            // Ignore
        }
    }

    /**
     * Get current music name.
     */
    static getCurrentMusic(): string | null {
        return AudioManager._currentMusic;
    }

    /**
     * Check if music is playing.
     */
    static isMusicPlaying(): boolean {
        if (!AudioManager._currentMusic) return false;
        const audio = AudioManager._music.get(AudioManager._currentMusic);
        return audio?.isPlaying ?? false;
    }

    // ===============================
    // Volume Control
    // ===============================

    /**
     * Set master volume (affects all audio).
     */
    static setMasterVolume(volume: number): void {
        AudioManager._masterVolume = Math.max(0, Math.min(1, volume));
        AudioManager._updateMusicVolume();
    }

    /**
     * Get master volume.
     */
    static getMasterVolume(): number {
        return AudioManager._masterVolume;
    }

    /**
     * Set sound effects volume.
     */
    static setSoundVolume(volume: number): void {
        AudioManager._soundVolume = Math.max(0, Math.min(1, volume));
    }

    /**
     * Get sound effects volume.
     */
    static getSoundVolume(): number {
        return AudioManager._soundVolume;
    }

    /**
     * Set music volume.
     */
    static setMusicVolume(volume: number): void {
        AudioManager._musicVolume = Math.max(0, Math.min(1, volume));
        AudioManager._updateMusicVolume();
    }

    /**
     * Get music volume.
     */
    static getMusicVolume(): number {
        return AudioManager._musicVolume;
    }

    /**
     * Mute all audio.
     */
    static mute(): void {
        AudioManager._muted = true;
        AudioManager.pauseMusic();
    }

    /**
     * Unmute all audio.
     */
    static unmute(): void {
        AudioManager._muted = false;
        AudioManager.resumeMusic();
    }

    /**
     * Check if muted.
     */
    static isMuted(): boolean {
        return AudioManager._muted;
    }

    /**
     * Toggle mute.
     */
    static toggleMute(): boolean {
        if (AudioManager._muted) {
            AudioManager.unmute();
        } else {
            AudioManager.mute();
        }
        return AudioManager._muted;
    }

    // ===============================
    // Cleanup
    // ===============================

    /**
     * Unload a sound.
     */
    static async unloadSound(name: string): Promise<void> {
        const audio = AudioManager._sounds.get(name);
        if (!audio) return;

        try {
            await audio.source.unloadAsync();
        } catch (e) {
            // Ignore
        }

        AudioManager._sounds.delete(name);
    }

    /**
     * Unload music.
     */
    static async unloadMusic(name: string): Promise<void> {
        if (AudioManager._currentMusic === name) {
            await AudioManager.stopMusic();
        }

        const audio = AudioManager._music.get(name);
        if (!audio) return;

        try {
            await audio.source.unloadAsync();
        } catch (e) {
            // Ignore
        }

        AudioManager._music.delete(name);
    }

    /**
     * Unload all audio.
     */
    static async unloadAll(): Promise<void> {
        await AudioManager.stopMusic();

        for (const [name] of AudioManager._sounds) {
            await AudioManager.unloadSound(name);
        }

        for (const [name] of AudioManager._music) {
            await AudioManager.unloadMusic(name);
        }
    }

    // ===============================
    // Private helpers
    // ===============================

    private static async _updateMusicVolume(): Promise<void> {
        if (!AudioManager._currentMusic) return;

        const audio = AudioManager._music.get(AudioManager._currentMusic);
        if (!audio) return;

        const volume = audio.volume * AudioManager._musicVolume * AudioManager._masterVolume;

        try {
            await audio.source.setVolumeAsync(volume);
        } catch (e) {
            // Ignore
        }
    }

    private static async _fadeVolume(
        audio: AudioInstance,
        from: number,
        to: number,
        duration: number
    ): Promise<void> {
        const steps = 20;
        const stepDuration = (duration * 1000) / steps;
        const volumeStep = (to - from) / steps;

        let currentVolume = from;

        for (let i = 0; i < steps; i++) {
            currentVolume += volumeStep;
            try {
                await audio.source.setVolumeAsync(currentVolume * AudioManager._masterVolume);
            } catch (e) {
                break;
            }
            await new Promise(resolve => setTimeout(resolve, stepDuration));
        }
    }
}
