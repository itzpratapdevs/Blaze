import React, { useEffect, useCallback, useRef } from 'react';
import { useGame } from './BlazeGame';

// ============================================
// SHAPE COMPONENTS
// ============================================

interface BaseShapeProps {
    /** X position */
    x: number;
    /** Y position */
    y: number;
    /** Fill color (CSS color) */
    color?: string;
    /** Stroke color (CSS color) */
    strokeColor?: string;
    /** Stroke width */
    strokeWidth?: number;
    /** Opacity (0-1) */
    opacity?: number;
    /** Rotation in radians */
    rotation?: number;
    /** Called every frame */
    onUpdate?: (dt: number) => void;
}

// ============================================
// RECTANGLE
// ============================================

export interface RectangleProps extends BaseShapeProps {
    width: number;
    height: number;
    /** Corner radius for rounded rectangles */
    radius?: number;
}

/**
 * Rectangle shape component.
 * 
 * @example
 * ```tsx
 * <Rectangle x={100} y={100} width={50} height={30} color="#ff0000" />
 * ```
 */
export function Rectangle({
    x,
    y,
    width,
    height,
    color = '#ffffff',
    strokeColor,
    strokeWidth = 1,
    opacity = 1,
    rotation = 0,
    radius = 0,
    onUpdate,
}: RectangleProps) {
    const { ctx, onUpdate: registerUpdate } = useGame();
    const stateRef = useRef({ x, y });

    useEffect(() => {
        stateRef.current = { x, y };
    }, [x, y]);

    useEffect(() => {
        if (!ctx) return;

        return registerUpdate((dt) => {
            onUpdate?.(dt);

            ctx.save();

            if (opacity !== 1) ctx.globalAlpha = opacity;

            ctx.translate(stateRef.current.x + width / 2, stateRef.current.y + height / 2);
            if (rotation !== 0) ctx.rotate(rotation);

            if (radius > 0) {
                // Rounded rectangle
                ctx.beginPath();
                ctx.roundRect(-width / 2, -height / 2, width, height, radius);
                if (color) {
                    ctx.fillStyle = color;
                    ctx.fill();
                }
                if (strokeColor) {
                    ctx.strokeStyle = strokeColor;
                    ctx.lineWidth = strokeWidth;
                    ctx.stroke();
                }
            } else {
                if (color) {
                    ctx.fillStyle = color;
                    ctx.fillRect(-width / 2, -height / 2, width, height);
                }
                if (strokeColor) {
                    ctx.strokeStyle = strokeColor;
                    ctx.lineWidth = strokeWidth;
                    ctx.strokeRect(-width / 2, -height / 2, width, height);
                }
            }

            ctx.restore();
        });
    }, [ctx, registerUpdate, width, height, color, strokeColor, strokeWidth, opacity, rotation, radius, onUpdate]);

    return null;
}

// ============================================
// CIRCLE
// ============================================

export interface CircleProps extends BaseShapeProps {
    radius: number;
}

/**
 * Circle shape component.
 * 
 * @example
 * ```tsx
 * <Circle x={200} y={200} radius={50} color="#00ff00" />
 * ```
 */
export function Circle({
    x,
    y,
    radius,
    color = '#ffffff',
    strokeColor,
    strokeWidth = 1,
    opacity = 1,
    onUpdate,
}: CircleProps) {
    const { ctx, onUpdate: registerUpdate } = useGame();
    const stateRef = useRef({ x, y });

    useEffect(() => {
        stateRef.current = { x, y };
    }, [x, y]);

    useEffect(() => {
        if (!ctx) return;

        return registerUpdate((dt) => {
            onUpdate?.(dt);

            ctx.save();

            if (opacity !== 1) ctx.globalAlpha = opacity;

            ctx.beginPath();
            ctx.arc(stateRef.current.x, stateRef.current.y, radius, 0, Math.PI * 2);

            if (color) {
                ctx.fillStyle = color;
                ctx.fill();
            }
            if (strokeColor) {
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = strokeWidth;
                ctx.stroke();
            }

            ctx.restore();
        });
    }, [ctx, registerUpdate, radius, color, strokeColor, strokeWidth, opacity, onUpdate]);

    return null;
}

// ============================================
// LINE
// ============================================

export interface LineProps {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color?: string;
    width?: number;
    opacity?: number;
    /** Line cap style */
    lineCap?: 'butt' | 'round' | 'square';
    onUpdate?: (dt: number) => void;
}

/**
 * Line shape component.
 * 
 * @example
 * ```tsx
 * <Line x1={0} y1={0} x2={100} y2={100} color="#ffffff" width={2} />
 * ```
 */
export function Line({
    x1,
    y1,
    x2,
    y2,
    color = '#ffffff',
    width = 1,
    opacity = 1,
    lineCap = 'round',
    onUpdate,
}: LineProps) {
    const { ctx, onUpdate: registerUpdate } = useGame();

    useEffect(() => {
        if (!ctx) return;

        return registerUpdate((dt) => {
            onUpdate?.(dt);

            ctx.save();

            if (opacity !== 1) ctx.globalAlpha = opacity;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.lineCap = lineCap;
            ctx.stroke();

            ctx.restore();
        });
    }, [ctx, registerUpdate, x1, y1, x2, y2, color, width, opacity, lineCap, onUpdate]);

    return null;
}

// ============================================
// POLYGON
// ============================================

export interface PolygonProps extends BaseShapeProps {
    /** Array of [x, y] points */
    points: [number, number][];
    /** Close the path */
    closed?: boolean;
}

/**
 * Polygon shape component.
 * 
 * @example
 * ```tsx
 * <Polygon 
 *   x={100} y={100} 
 *   points={[[0, 0], [50, 100], [100, 0]]} 
 *   color="#0000ff" 
 * />
 * ```
 */
export function Polygon({
    x,
    y,
    points,
    color = '#ffffff',
    strokeColor,
    strokeWidth = 1,
    opacity = 1,
    rotation = 0,
    closed = true,
    onUpdate,
}: PolygonProps) {
    const { ctx, onUpdate: registerUpdate } = useGame();

    useEffect(() => {
        if (!ctx || points.length < 2) return;

        return registerUpdate((dt) => {
            onUpdate?.(dt);

            ctx.save();

            if (opacity !== 1) ctx.globalAlpha = opacity;

            ctx.translate(x, y);
            if (rotation !== 0) ctx.rotate(rotation);

            ctx.beginPath();
            ctx.moveTo(points[0][0], points[0][1]);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i][0], points[i][1]);
            }
            if (closed) ctx.closePath();

            if (color) {
                ctx.fillStyle = color;
                ctx.fill();
            }
            if (strokeColor) {
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = strokeWidth;
                ctx.stroke();
            }

            ctx.restore();
        });
    }, [ctx, registerUpdate, x, y, points, color, strokeColor, strokeWidth, opacity, rotation, closed, onUpdate]);

    return null;
}

// ============================================
// TEXT
// ============================================

export interface TextProps {
    x: number;
    y: number;
    children: string | number;
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string | number;
    textAlign?: 'left' | 'center' | 'right';
    textBaseline?: 'top' | 'middle' | 'bottom' | 'alphabetic';
    opacity?: number;
    rotation?: number;
    /** Stroke text instead of fill */
    stroke?: boolean;
    strokeWidth?: number;
    onUpdate?: (dt: number) => void;
}

/**
 * Text rendering component.
 * 
 * @example
 * ```tsx
 * <Text x={10} y={30} fontSize={24} color="#ffffff">
 *   Score: {score}
 * </Text>
 * ```
 */
export function Text({
    x,
    y,
    children,
    color = '#ffffff',
    fontSize = 16,
    fontFamily = 'Arial, sans-serif',
    fontWeight = 'normal',
    textAlign = 'left',
    textBaseline = 'top',
    opacity = 1,
    rotation = 0,
    stroke = false,
    strokeWidth = 1,
    onUpdate,
}: TextProps) {
    const { ctx, onUpdate: registerUpdate } = useGame();
    const text = String(children);

    useEffect(() => {
        if (!ctx) return;

        return registerUpdate((dt) => {
            onUpdate?.(dt);

            ctx.save();

            if (opacity !== 1) ctx.globalAlpha = opacity;

            ctx.translate(x, y);
            if (rotation !== 0) ctx.rotate(rotation);

            ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
            ctx.textAlign = textAlign;
            ctx.textBaseline = textBaseline;

            if (stroke) {
                ctx.strokeStyle = color;
                ctx.lineWidth = strokeWidth;
                ctx.strokeText(text, 0, 0);
            } else {
                ctx.fillStyle = color;
                ctx.fillText(text, 0, 0);
            }

            ctx.restore();
        });
    }, [ctx, registerUpdate, x, y, text, color, fontSize, fontFamily, fontWeight, textAlign, textBaseline, opacity, rotation, stroke, strokeWidth, onUpdate]);

    return null;
}
