import type { Renderer } from '../rendering/Renderer';
import type { Entity } from '../core/Entity';
import { Collider } from '../collision/Collider';
import { Circle } from '../collision/Circle';
import { Sprite } from '../rendering/Sprite';
import { Time } from '../utils/Time';
import { Vector2 } from '../math/Vector2';

// Declare __DEV__ for TypeScript
declare const __DEV__: boolean | undefined;

/**
 * Debug visualization settings.
 */
export interface DebugSettings {
    showColliders: boolean;
    colliderColor: string;
    showSpriteBounds: boolean;
    spriteBoundsColor: string;
    showFPS: boolean;
    fpsPosition: Vector2;
    showGrid: boolean;
    gridSize: number;
    gridColor: string;
    showOrigins: boolean;
}

const DEFAULT_SETTINGS: DebugSettings = {
    showColliders: true,
    colliderColor: '#00ff00',
    showSpriteBounds: false,
    spriteBoundsColor: '#ffff00',
    showFPS: true,
    fpsPosition: new Vector2(10, 20),
    showGrid: false,
    gridSize: 32,
    gridColor: 'rgba(255, 255, 255, 0.1)',
    showOrigins: false,
};

/**
 * DebugRenderer for visualizing game internals.
 */
export class DebugRenderer {
    static enabled: boolean = typeof __DEV__ !== 'undefined' ? __DEV__ : false;
    static settings: DebugSettings = { ...DEFAULT_SETTINGS };

    static configure(settings: Partial<DebugSettings>): void {
        DebugRenderer.settings = { ...DebugRenderer.settings, ...settings };
    }

    static resetSettings(): void {
        DebugRenderer.settings = { ...DEFAULT_SETTINGS };
    }

    static render(renderer: Renderer, entities: Entity[]): void {
        if (!DebugRenderer.enabled) return;

        const s = DebugRenderer.settings;

        if (s.showGrid) {
            DebugRenderer.drawGrid(renderer, s.gridSize, s.gridColor);
        }

        if (s.showColliders) {
            DebugRenderer.drawColliders(renderer, entities, s.colliderColor);
        }

        if (s.showSpriteBounds) {
            DebugRenderer.drawSpriteBounds(renderer, entities, s.spriteBoundsColor);
        }

        if (s.showOrigins) {
            DebugRenderer.drawOrigins(renderer, entities);
        }

        if (s.showFPS) {
            DebugRenderer.drawFPS(renderer, s.fpsPosition.x, s.fpsPosition.y);
        }
    }

    static drawColliders(
        renderer: Renderer,
        entities: Entity[],
        color: string = '#00ff00'
    ): void {
        for (const entity of entities) {
            if (!entity.active) continue;

            // Use getComponent with string name instead of class reference
            const collider = entity.getByName<Collider>('Collider');
            if (collider && collider.enabled) {
                const bounds = collider.bounds;
                renderer.drawScreenRect(
                    bounds.min.x,
                    bounds.min.y,
                    bounds.width,
                    bounds.height,
                    color,
                    false,
                    1
                );
            }
        }
    }

    static drawSpriteBounds(
        renderer: Renderer,
        entities: Entity[],
        color: string = '#ffff00'
    ): void {
        for (const entity of entities) {
            if (!entity.active) continue;

            const sprite = entity.getByName<Sprite>('Sprite');
            if (sprite && sprite.visible) {
                const bounds = sprite.getBounds();
                renderer.drawScreenRect(
                    bounds.left,
                    bounds.top,
                    bounds.right - bounds.left,
                    bounds.bottom - bounds.top,
                    color,
                    false,
                    1
                );
            }
        }
    }

    static drawOrigins(
        renderer: Renderer,
        entities: Entity[],
        size: number = 4
    ): void {
        for (const entity of entities) {
            if (!entity.active) continue;

            const sprite = entity.getByName<Sprite>('Sprite');
            if (sprite) {
                const x = sprite.x;
                const y = sprite.y;

                // Draw crosshair
                renderer.drawLine(x - size, y, x + size, y, { color: '#ff0000', strokeWidth: 1 });
                renderer.drawLine(x, y - size, x, y + size, { color: '#ff0000', strokeWidth: 1 });
            }
        }
    }

    static drawGrid(
        renderer: Renderer,
        cellSize: number = 32,
        color: string = 'rgba(255, 255, 255, 0.1)'
    ): void {
        const width = renderer.width;
        const height = renderer.height;

        for (let x = 0; x <= width; x += cellSize) {
            renderer.drawLine(x, 0, x, height, { color, strokeWidth: 1 });
        }

        for (let y = 0; y <= height; y += cellSize) {
            renderer.drawLine(0, y, width, y, { color, strokeWidth: 1 });
        }
    }

    static drawFPS(renderer: Renderer, x: number = 10, y: number = 20): void {
        const fps = Math.round(Time.fps);
        const color = fps >= 55 ? '#00ff00' : fps >= 30 ? '#ffff00' : '#ff0000';

        renderer.drawText(`FPS: ${fps}`, x, y, {
            color,
            fontSize: 14,
        });
    }

    static drawStats(renderer: Renderer, x: number = 10, y: number = 40): void {
        const stats = [
            `Frame: ${Time.frameCount}`,
            `Delta: ${(Time.delta * 1000).toFixed(2)}ms`,
            `Elapsed: ${Time.elapsed.toFixed(1)}s`,
        ];

        let offsetY = y;
        for (const stat of stats) {
            renderer.drawText(stat, x, offsetY, { color: '#ffffff', fontSize: 12 });
            offsetY += 16;
        }
    }

    static drawCircle(renderer: Renderer, circle: Circle, color: string = '#00ff00'): void {
        renderer.drawCircle(circle.center.x, circle.center.y, circle.radius, {
            fill: false,
            color,
            strokeWidth: 1,
        });
    }

    static drawVector(
        renderer: Renderer,
        origin: Vector2,
        direction: Vector2,
        scale: number = 1,
        color: string = '#00ffff'
    ): void {
        const end = new Vector2(
            origin.x + direction.x * scale,
            origin.y + direction.y * scale
        );

        renderer.drawLine(origin.x, origin.y, end.x, end.y, { color, strokeWidth: 2 });

        // Draw arrowhead
        const angle = Math.atan2(direction.y, direction.x);
        const arrowSize = 8;
        const arrowAngle = Math.PI / 6;

        renderer.drawLine(
            end.x,
            end.y,
            end.x - arrowSize * Math.cos(angle - arrowAngle),
            end.y - arrowSize * Math.sin(angle - arrowAngle),
            { color, strokeWidth: 2 }
        );
        renderer.drawLine(
            end.x,
            end.y,
            end.x - arrowSize * Math.cos(angle + arrowAngle),
            end.y - arrowSize * Math.sin(angle + arrowAngle),
            { color, strokeWidth: 2 }
        );
    }
}
