import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useGame } from './BlazeGame';

// ============================================
// PARTICLE SYSTEM
// ============================================

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
    sizeEnd: number;
    color: string;
    rotation: number;
    rotationSpeed: number;
}

export interface ParticleSystemProps {
    /** X position of emitter */
    x: number;
    /** Y position of emitter */
    y: number;
    /** Is the emitter active */
    active?: boolean;
    /** Particles per second */
    emissionRate?: number;
    /** Maximum particles alive at once */
    maxParticles?: number;
    /** Particle lifespan in seconds */
    lifespan?: number | { min: number; max: number };
    /** Particle speed */
    speed?: number | { min: number; max: number };
    /** Emission angle in degrees */
    angle?: number | { min: number; max: number };
    /** Particle colors (random selection) */
    colors?: string[];
    /** Particle size */
    size?: number | { start: number; end: number };
    /** Gravity */
    gravity?: { x: number; y: number };
    /** Particle shape */
    shape?: 'circle' | 'square';
    /** Blend mode */
    blendMode?: GlobalCompositeOperation;
}

function randomRange(value: number | { min: number; max: number }): number {
    if (typeof value === 'number') return value;
    return value.min + Math.random() * (value.max - value.min);
}

function randomFromArray<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Particle system component for visual effects.
 * 
 * @example
 * ```tsx
 * <ParticleSystem
 *   x={400} y={300}
 *   colors={['#ff0000', '#ff8800', '#ffff00']}
 *   speed={{ min: 50, max: 150 }}
 *   lifespan={{ min: 0.5, max: 1.5 }}
 * />
 * ```
 */
export function ParticleSystem({
    x,
    y,
    active = true,
    emissionRate = 50,
    maxParticles = 500,
    lifespan = 1,
    speed = 100,
    angle = { min: 0, max: 360 },
    colors = ['#ffffff'],
    size = { start: 10, end: 0 },
    gravity = { x: 0, y: 0 },
    shape = 'circle',
    blendMode = 'source-over',
}: ParticleSystemProps) {
    const { ctx, onUpdate: registerUpdate } = useGame();
    const particlesRef = useRef<Particle[]>([]);
    const emitAccumulator = useRef(0);

    useEffect(() => {
        if (!ctx) return;

        return registerUpdate((dt) => {
            const particles = particlesRef.current;

            // Emit new particles
            if (active) {
                emitAccumulator.current += emissionRate * dt;

                while (emitAccumulator.current >= 1 && particles.length < maxParticles) {
                    emitAccumulator.current -= 1;

                    const angleRad = randomRange(angle) * (Math.PI / 180);
                    const spd = randomRange(speed);
                    const life = randomRange(lifespan);
                    const startSize = typeof size === 'number' ? size : size.start;
                    const endSize = typeof size === 'number' ? 0 : size.end;

                    particles.push({
                        x,
                        y,
                        vx: Math.cos(angleRad) * spd,
                        vy: Math.sin(angleRad) * spd,
                        life,
                        maxLife: life,
                        size: startSize,
                        sizeEnd: endSize,
                        color: randomFromArray(colors),
                        rotation: Math.random() * Math.PI * 2,
                        rotationSpeed: (Math.random() - 0.5) * 5,
                    });
                }
            }

            // Update particles
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];

                // Physics
                p.vx += gravity.x * dt;
                p.vy += gravity.y * dt;
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.rotation += p.rotationSpeed * dt;
                p.life -= dt;

                // Remove dead particles
                if (p.life <= 0) {
                    particles.splice(i, 1);
                }
            }

            // Render particles
            ctx.save();
            ctx.globalCompositeOperation = blendMode;

            for (const p of particles) {
                const lifeRatio = p.life / p.maxLife;
                const currentSize = p.sizeEnd + (p.size - p.sizeEnd) * lifeRatio;

                ctx.globalAlpha = lifeRatio;
                ctx.fillStyle = p.color;

                if (shape === 'circle') {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, currentSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rotation);
                    ctx.fillRect(-currentSize / 2, -currentSize / 2, currentSize, currentSize);
                    ctx.restore();
                }
            }

            ctx.restore();
        });
    }, [ctx, registerUpdate, x, y, active, emissionRate, maxParticles, lifespan, speed, angle, colors, size, gravity, shape, blendMode]);

    return null;
}

// ============================================
// PARALLAX
// ============================================

export interface ParallaxLayerProps {
    /** Image source */
    src: string;
    /** Scroll speed multiplier (0-1, lower = further away) */
    speed: number;
    /** Vertical offset */
    offsetY?: number;
}

export interface ParallaxProps {
    /** Movement direction and speed */
    velocity?: { x: number; y: number };
    children: React.ReactElement<ParallaxLayerProps> | React.ReactElement<ParallaxLayerProps>[];
}

interface ParallaxLayerInternal {
    src: string;
    speed: number;
    offsetY: number;
    image: HTMLImageElement | null;
    offsetX: number;
}

/**
 * Parallax background component.
 * 
 * @example
 * ```tsx
 * <Parallax velocity={{ x: 50, y: 0 }}>
 *   <ParallaxLayer src="/sky.png" speed={0.1} />
 *   <ParallaxLayer src="/mountains.png" speed={0.3} />
 *   <ParallaxLayer src="/trees.png" speed={0.6} />
 * </Parallax>
 * ```
 */
export function Parallax({ velocity = { x: 50, y: 0 }, children }: ParallaxProps) {
    const { ctx, width, height, onUpdate: registerUpdate } = useGame();
    const layersRef = useRef<ParallaxLayerInternal[]>([]);

    // Initialize layers from children
    useEffect(() => {
        const childArray = React.Children.toArray(children) as React.ReactElement<ParallaxLayerProps>[];

        layersRef.current = childArray.map(child => ({
            src: child.props.src,
            speed: child.props.speed,
            offsetY: child.props.offsetY || 0,
            image: null,
            offsetX: 0,
        }));

        // Load images
        layersRef.current.forEach(layer => {
            const img = new Image();
            img.onload = () => {
                layer.image = img;
            };
            img.src = layer.src;
        });
    }, [children]);

    useEffect(() => {
        if (!ctx) return;

        return registerUpdate((dt) => {
            for (const layer of layersRef.current) {
                if (!layer.image) continue;

                // Update offset
                layer.offsetX += velocity.x * layer.speed * dt;

                // Wrap around
                const imgWidth = layer.image.width;
                if (layer.offsetX > imgWidth) layer.offsetX -= imgWidth;
                if (layer.offsetX < 0) layer.offsetX += imgWidth;

                // Draw tiled
                const startX = -layer.offsetX;
                for (let x = startX; x < width; x += imgWidth) {
                    ctx.drawImage(layer.image, x, layer.offsetY);
                }
            }
        });
    }, [ctx, registerUpdate, velocity, width, height]);

    return null;
}

/**
 * Parallax layer component (used inside <Parallax>).
 */
export function ParallaxLayer(_props: ParallaxLayerProps) {
    return null; // Just a data holder
}

// ============================================
// TILED BACKGROUND
// ============================================

export interface TiledBackgroundProps {
    src: string;
    scrollX?: number;
    scrollY?: number;
    opacity?: number;
}

/**
 * Tiled repeating background.
 * 
 * @example
 * ```tsx
 * <TiledBackground src="/tile.png" scrollX={50} />
 * ```
 */
export function TiledBackground({
    src,
    scrollX = 0,
    scrollY = 0,
    opacity = 1,
}: TiledBackgroundProps) {
    const { ctx, width, height, onUpdate: registerUpdate } = useGame();
    const imageRef = useRef<HTMLImageElement | null>(null);
    const offsetRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const img = new Image();
        img.onload = () => {
            imageRef.current = img;
        };
        img.src = src;
    }, [src]);

    useEffect(() => {
        if (!ctx) return;

        return registerUpdate((dt) => {
            if (!imageRef.current) return;

            const img = imageRef.current;

            // Update scroll
            offsetRef.current.x += scrollX * dt;
            offsetRef.current.y += scrollY * dt;

            // Wrap
            if (img.width > 0) offsetRef.current.x %= img.width;
            if (img.height > 0) offsetRef.current.y %= img.height;

            ctx.save();
            if (opacity !== 1) ctx.globalAlpha = opacity;

            // Tile
            const startX = -(offsetRef.current.x % img.width);
            const startY = -(offsetRef.current.y % img.height);

            for (let y = startY; y < height; y += img.height) {
                for (let x = startX; x < width; x += img.width) {
                    ctx.drawImage(img, x, y);
                }
            }

            ctx.restore();
        });
    }, [ctx, registerUpdate, scrollX, scrollY, opacity, width, height]);

    return null;
}
