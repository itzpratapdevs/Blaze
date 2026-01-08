import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useGame } from './BlazeGame';

// ============================================
// JOYSTICK COMPONENT
// ============================================

export interface JoystickProps {
    /** X position */
    x: number;
    /** Y position */
    y: number;
    /** Joystick size (diameter) */
    size?: number;
    /** Base color */
    baseColor?: string;
    /** Stick color */
    stickColor?: string;
    /** Opacity */
    opacity?: number;
    /** Dead zone (0-1) */
    deadZone?: number;
    /** Called when joystick moves */
    onMove?: (data: { x: number; y: number; angle: number; force: number }) => void;
    /** Called when joystick released */
    onRelease?: () => void;
}

/**
 * Virtual joystick for touch/mouse controls.
 * 
 * @example
 * ```tsx
 * <Joystick
 *   x={80} y={500}
 *   size={120}
 *   onMove={({ x, y }) => {
 *     playerVelocity.x = x * 200;
 *     playerVelocity.y = y * 200;
 *   }}
 * />
 * ```
 */
export function Joystick({
    x,
    y,
    size = 100,
    baseColor = 'rgba(255, 255, 255, 0.3)',
    stickColor = 'rgba(255, 255, 255, 0.6)',
    opacity = 1,
    deadZone = 0.1,
    onMove,
    onRelease,
}: JoystickProps) {
    const { ctx, canvasRef, onUpdate } = useGame();
    const stateRef = useRef({
        active: false,
        stickX: 0,
        stickY: 0,
        touchId: -1,
    });

    const baseRadius = size / 2;
    const stickRadius = size / 4;
    const maxDistance = baseRadius - stickRadius;

    // Handle input
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const getPos = (e: PointerEvent) => {
            const rect = canvas.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
        };

        const isInside = (px: number, py: number) => {
            const dx = px - x;
            const dy = py - y;
            return Math.sqrt(dx * dx + dy * dy) <= baseRadius;
        };

        const handlePointerDown = (e: PointerEvent) => {
            const pos = getPos(e);
            if (isInside(pos.x, pos.y)) {
                stateRef.current.active = true;
                stateRef.current.touchId = e.pointerId;
                canvas.setPointerCapture(e.pointerId);
            }
        };

        const handlePointerMove = (e: PointerEvent) => {
            if (!stateRef.current.active) return;
            if (e.pointerId !== stateRef.current.touchId) return;

            const pos = getPos(e);
            let dx = pos.x - x;
            let dy = pos.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Clamp to max distance
            if (distance > maxDistance) {
                dx = (dx / distance) * maxDistance;
                dy = (dy / distance) * maxDistance;
            }

            stateRef.current.stickX = dx;
            stateRef.current.stickY = dy;

            // Calculate normalized values
            const force = Math.min(distance / maxDistance, 1);
            const angle = Math.atan2(dy, dx);
            const normX = dx / maxDistance;
            const normY = dy / maxDistance;

            // Apply dead zone
            if (force > deadZone) {
                onMove?.({
                    x: normX,
                    y: normY,
                    angle,
                    force,
                });
            } else {
                onMove?.({ x: 0, y: 0, angle: 0, force: 0 });
            }
        };

        const handlePointerUp = (e: PointerEvent) => {
            if (e.pointerId !== stateRef.current.touchId) return;

            stateRef.current.active = false;
            stateRef.current.stickX = 0;
            stateRef.current.stickY = 0;
            stateRef.current.touchId = -1;

            onMove?.({ x: 0, y: 0, angle: 0, force: 0 });
            onRelease?.();
        };

        canvas.addEventListener('pointerdown', handlePointerDown);
        canvas.addEventListener('pointermove', handlePointerMove);
        canvas.addEventListener('pointerup', handlePointerUp);
        canvas.addEventListener('pointercancel', handlePointerUp);

        return () => {
            canvas.removeEventListener('pointerdown', handlePointerDown);
            canvas.removeEventListener('pointermove', handlePointerMove);
            canvas.removeEventListener('pointerup', handlePointerUp);
            canvas.removeEventListener('pointercancel', handlePointerUp);
        };
    }, [canvasRef, x, y, baseRadius, maxDistance, deadZone, onMove, onRelease]);

    // Render
    useEffect(() => {
        if (!ctx) return;

        return onUpdate(() => {
            ctx.save();
            ctx.globalAlpha = opacity;

            // Draw base
            ctx.beginPath();
            ctx.arc(x, y, baseRadius, 0, Math.PI * 2);
            ctx.fillStyle = baseColor;
            ctx.fill();

            // Draw stick
            const state = stateRef.current;
            ctx.beginPath();
            ctx.arc(x + state.stickX, y + state.stickY, stickRadius, 0, Math.PI * 2);
            ctx.fillStyle = stickColor;
            ctx.fill();

            ctx.restore();
        });
    }, [ctx, onUpdate, x, y, baseRadius, stickRadius, baseColor, stickColor, opacity]);

    return null;
}

// ============================================
// BUTTON COMPONENT
// ============================================

export interface ButtonProps {
    /** X position */
    x: number;
    /** Y position */
    y: number;
    /** Button size */
    size?: number;
    /** Button image */
    src?: string;
    /** Button color (if no image) */
    color?: string;
    /** Pressed color */
    pressedColor?: string;
    /** Opacity */
    opacity?: number;
    /** Called when pressed */
    onPress?: () => void;
    /** Called when released */
    onRelease?: () => void;
    /** Label text */
    label?: string;
    /** Label color */
    labelColor?: string;
}

/**
 * Game button component.
 * 
 * @example
 * ```tsx
 * <Button
 *   x={700} y={500}
 *   size={60}
 *   color="#ff0000"
 *   label="JUMP"
 *   onPress={() => jump()}
 * />
 * ```
 */
export function Button({
    x,
    y,
    size = 50,
    src,
    color = 'rgba(255, 255, 255, 0.3)',
    pressedColor = 'rgba(255, 255, 255, 0.5)',
    opacity = 1,
    onPress,
    onRelease,
    label,
    labelColor = '#ffffff',
}: ButtonProps) {
    const { ctx, canvasRef, onUpdate } = useGame();
    const [pressed, setPressed] = useState(false);
    const imageRef = useRef<HTMLImageElement | null>(null);

    const radius = size / 2;

    // Load image if provided
    useEffect(() => {
        if (src) {
            const img = new Image();
            img.onload = () => {
                imageRef.current = img;
            };
            img.src = src;
        }
    }, [src]);

    // Handle input
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const getPos = (e: PointerEvent) => {
            const rect = canvas.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
        };

        const isInside = (px: number, py: number) => {
            const dx = px - x;
            const dy = py - y;
            return Math.sqrt(dx * dx + dy * dy) <= radius;
        };

        const handlePointerDown = (e: PointerEvent) => {
            const pos = getPos(e);
            if (isInside(pos.x, pos.y)) {
                setPressed(true);
                onPress?.();
            }
        };

        const handlePointerUp = () => {
            if (pressed) {
                setPressed(false);
                onRelease?.();
            }
        };

        canvas.addEventListener('pointerdown', handlePointerDown);
        canvas.addEventListener('pointerup', handlePointerUp);
        canvas.addEventListener('pointercancel', handlePointerUp);

        return () => {
            canvas.removeEventListener('pointerdown', handlePointerDown);
            canvas.removeEventListener('pointerup', handlePointerUp);
            canvas.removeEventListener('pointercancel', handlePointerUp);
        };
    }, [canvasRef, x, y, radius, pressed, onPress, onRelease]);

    // Render
    useEffect(() => {
        if (!ctx) return;

        return onUpdate(() => {
            ctx.save();
            ctx.globalAlpha = opacity;

            if (imageRef.current) {
                // Draw image
                const scale = pressed ? 0.9 : 1;
                const drawSize = size * scale;
                ctx.drawImage(
                    imageRef.current,
                    x - drawSize / 2,
                    y - drawSize / 2,
                    drawSize,
                    drawSize
                );
            } else {
                // Draw circle
                ctx.beginPath();
                ctx.arc(x, y, radius * (pressed ? 0.9 : 1), 0, Math.PI * 2);
                ctx.fillStyle = pressed ? pressedColor : color;
                ctx.fill();
            }

            // Draw label
            if (label) {
                ctx.fillStyle = labelColor;
                ctx.font = `bold ${size / 4}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(label, x, y);
            }

            ctx.restore();
        });
    }, [ctx, onUpdate, x, y, size, radius, color, pressedColor, pressed, opacity, label, labelColor]);

    return null;
}

// ============================================
// PROGRESS BAR COMPONENT
// ============================================

export interface ProgressBarProps {
    /** X position */
    x: number;
    /** Y position */
    y: number;
    /** Width */
    width: number;
    /** Height */
    height?: number;
    /** Current value */
    value: number;
    /** Maximum value */
    maxValue?: number;
    /** Background color */
    backgroundColor?: string;
    /** Fill color (or gradient array) */
    fillColor?: string | string[];
    /** Border color */
    borderColor?: string;
    /** Border width */
    borderWidth?: number;
    /** Border radius */
    borderRadius?: number;
    /** Animate value changes */
    animated?: boolean;
}

/**
 * Progress/health bar component.
 * 
 * @example
 * ```tsx
 * <ProgressBar
 *   x={10} y={10}
 *   width={200} height={20}
 *   value={health} maxValue={100}
 *   fillColor={['#ff0000', '#00ff00']}
 * />
 * ```
 */
export function ProgressBar({
    x,
    y,
    width,
    height = 20,
    value,
    maxValue = 100,
    backgroundColor = '#333333',
    fillColor = '#00ff00',
    borderColor,
    borderWidth = 0,
    borderRadius = 0,
    animated = true,
}: ProgressBarProps) {
    const { ctx, onUpdate } = useGame();
    const displayValue = useRef(value);

    // Animate value
    useEffect(() => {
        if (!animated) {
            displayValue.current = value;
        }
    }, [value, animated]);

    useEffect(() => {
        if (!ctx) return;

        return onUpdate((dt) => {
            // Smooth animation
            if (animated) {
                const diff = value - displayValue.current;
                displayValue.current += diff * Math.min(1, dt * 10);
            }

            const progress = Math.max(0, Math.min(1, displayValue.current / maxValue));
            const fillWidth = (width - borderWidth * 2) * progress;

            ctx.save();

            // Draw background
            if (borderRadius > 0) {
                ctx.beginPath();
                ctx.roundRect(x, y, width, height, borderRadius);
                ctx.fillStyle = backgroundColor;
                ctx.fill();
            } else {
                ctx.fillStyle = backgroundColor;
                ctx.fillRect(x, y, width, height);
            }

            // Draw fill
            if (fillWidth > 0) {
                let fill: string | CanvasGradient = fillColor as string;

                if (Array.isArray(fillColor)) {
                    const gradient = ctx.createLinearGradient(x, y, x + width, y);
                    fillColor.forEach((color, i) => {
                        gradient.addColorStop(i / (fillColor.length - 1), color);
                    });
                    fill = gradient;
                }

                if (borderRadius > 0) {
                    ctx.beginPath();
                    ctx.roundRect(
                        x + borderWidth,
                        y + borderWidth,
                        fillWidth,
                        height - borderWidth * 2,
                        Math.max(0, borderRadius - borderWidth)
                    );
                    ctx.fillStyle = fill;
                    ctx.fill();
                } else {
                    ctx.fillStyle = fill;
                    ctx.fillRect(
                        x + borderWidth,
                        y + borderWidth,
                        fillWidth,
                        height - borderWidth * 2
                    );
                }
            }

            // Draw border
            if (borderColor && borderWidth > 0) {
                if (borderRadius > 0) {
                    ctx.beginPath();
                    ctx.roundRect(x, y, width, height, borderRadius);
                    ctx.strokeStyle = borderColor;
                    ctx.lineWidth = borderWidth;
                    ctx.stroke();
                } else {
                    ctx.strokeStyle = borderColor;
                    ctx.lineWidth = borderWidth;
                    ctx.strokeRect(x, y, width, height);
                }
            }

            ctx.restore();
        });
    }, [ctx, onUpdate, x, y, width, height, value, maxValue, backgroundColor, fillColor, borderColor, borderWidth, borderRadius, animated]);

    return null;
}

// ============================================
// NINE SLICE COMPONENT
// ============================================

export interface NineSliceProps {
    /** Image source */
    src: string;
    /** X position */
    x: number;
    /** Y position */
    y: number;
    /** Target width */
    width: number;
    /** Target height */
    height: number;
    /** Slice sizes */
    slices: { left: number; right: number; top: number; bottom: number };
    /** Opacity */
    opacity?: number;
}

/**
 * Nine-slice sprite for resizable UI panels.
 * 
 * @example
 * ```tsx
 * <NineSlice
 *   src="/panel.png"
 *   x={100} y={100}
 *   width={300} height={200}
 *   slices={{ left: 20, right: 20, top: 20, bottom: 20 }}
 * />
 * ```
 */
export function NineSlice({
    src,
    x,
    y,
    width,
    height,
    slices,
    opacity = 1,
}: NineSliceProps) {
    const { ctx, onUpdate } = useGame();
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [loaded, setLoaded] = useState(false);

    // Load image
    useEffect(() => {
        const img = new Image();
        img.onload = () => {
            imageRef.current = img;
            setLoaded(true);
        };
        img.src = src;
    }, [src]);

    // Render
    useEffect(() => {
        if (!ctx || !loaded || !imageRef.current) return;

        return onUpdate(() => {
            const img = imageRef.current!;
            const { left, right, top, bottom } = slices;
            const imgW = img.width;
            const imgH = img.height;
            const midW = imgW - left - right;
            const midH = imgH - top - bottom;
            const destMidW = width - left - right;
            const destMidH = height - top - bottom;

            ctx.save();
            ctx.globalAlpha = opacity;

            // Top-left
            ctx.drawImage(img, 0, 0, left, top, x, y, left, top);
            // Top-center
            ctx.drawImage(img, left, 0, midW, top, x + left, y, destMidW, top);
            // Top-right
            ctx.drawImage(img, imgW - right, 0, right, top, x + width - right, y, right, top);

            // Middle-left
            ctx.drawImage(img, 0, top, left, midH, x, y + top, left, destMidH);
            // Middle-center
            ctx.drawImage(img, left, top, midW, midH, x + left, y + top, destMidW, destMidH);
            // Middle-right
            ctx.drawImage(img, imgW - right, top, right, midH, x + width - right, y + top, right, destMidH);

            // Bottom-left
            ctx.drawImage(img, 0, imgH - bottom, left, bottom, x, y + height - bottom, left, bottom);
            // Bottom-center
            ctx.drawImage(img, left, imgH - bottom, midW, bottom, x + left, y + height - bottom, destMidW, bottom);
            // Bottom-right
            ctx.drawImage(img, imgW - right, imgH - bottom, right, bottom, x + width - right, y + height - bottom, right, bottom);

            ctx.restore();
        });
    }, [ctx, onUpdate, loaded, x, y, width, height, slices, opacity]);

    return null;
}

export default Joystick;
