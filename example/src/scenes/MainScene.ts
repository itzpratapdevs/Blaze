import {
    Scene,
    Entity,
    Sprite,
    Collider,
    CollisionLayers,
    Renderer,
    Vector2,
    Time,
    Logger,
} from 'blaze-engine';

/**
 * Main game scene demonstrating Blaze features.
 *
 * This is a simple endless runner where:
 * - Player moves with touch input
 * - Obstacles spawn and move toward the player
 * - Score increases over time
 * - Game ends on collision
 */
export class MainScene extends Scene {
    // Player entity
    private player!: Entity;
    private playerSprite!: Sprite;
    private playerCollider!: Collider;

    // Game state
    private score: number = 0;
    private isGameOver: boolean = false;
    private gameSpeed: number = 200;

    // Obstacles
    private obstacles: Entity[] = [];
    private lastObstacleTime: number = 0;
    private obstacleSpawnInterval: number = 2;

    // Screen bounds
    private readonly screenWidth = 360;
    private readonly screenHeight = 640;
    private readonly playerSize = 50;
    private readonly obstacleSize = 40;

    constructor() {
        super('MainScene');
    }

    async onLoad(): Promise<void> {
        Logger.info('MainScene: Loading...');

        // Create player entity
        this.player = this.createEntity('Player');
        this.player.tag = 'player';

        // Add sprite component (using colored rectangle for demo)
        this.playerSprite = this.player.add(
            new Sprite({
                x: this.screenWidth / 2,
                y: this.screenHeight - 100,
                width: this.playerSize,
                height: this.playerSize,
            })
        );
        this.playerSprite.centerAnchor();

        // Add collider component
        this.playerCollider = this.player.add(
            Collider.centered(this.playerSize, this.playerSize)
        );
        this.playerCollider.setLayer(CollisionLayers.Player);
        this.playerCollider.setMask(CollisionLayers.Enemy);

        Logger.info('MainScene: Loaded');
    }

    onStart(): void {
        Logger.info('MainScene: Started');
        this.score = 0;
        this.isGameOver = false;
        this.lastObstacleTime = Time.elapsed;
    }

    onUpdate(dt: number): void {
        if (this.isGameOver) return;

        // Update score
        this.score += dt * 10;

        // Increase difficulty over time
        this.gameSpeed = 200 + Math.min(this.score / 10, 300);

        // Handle player input
        this.handleInput();

        // Update player collider position
        this.playerCollider.updateFromPosition(
            this.playerSprite.x - this.playerSize / 2,
            this.playerSprite.y - this.playerSize / 2
        );

        // Spawn obstacles
        this.spawnObstacles();

        // Update obstacles
        this.updateObstacles(dt);

        // Check collisions
        this.checkCollisions();
    }

    onRender(renderer: Renderer): void {
        // Draw player as a cyan square
        renderer.drawRectXYWH(
            this.playerSprite.x - this.playerSize / 2,
            this.playerSprite.y - this.playerSize / 2,
            this.playerSize,
            this.playerSize,
            '#00d9ff',
            true
        );

        // Draw player outline
        renderer.drawRectXYWH(
            this.playerSprite.x - this.playerSize / 2,
            this.playerSprite.y - this.playerSize / 2,
            this.playerSize,
            this.playerSize,
            '#ffffff',
            false,
            2
        );

        // Draw obstacles as red squares
        for (const obstacle of this.obstacles) {
            const sprite = obstacle.get(Sprite);
            if (sprite) {
                renderer.drawRectXYWH(
                    sprite.x - this.obstacleSize / 2,
                    sprite.y - this.obstacleSize / 2,
                    this.obstacleSize,
                    this.obstacleSize,
                    '#ff4757',
                    true
                );

                renderer.drawRectXYWH(
                    sprite.x - this.obstacleSize / 2,
                    sprite.y - this.obstacleSize / 2,
                    this.obstacleSize,
                    this.obstacleSize,
                    '#ffffff',
                    false,
                    2
                );
            }
        }

        // Draw UI (screen space)
        renderer.drawText(`Score: ${Math.floor(this.score)}`, 20, 50, {
            color: '#ffffff',
            fontSize: 24,
        });

        renderer.drawText(`Speed: ${Math.floor(this.gameSpeed)}`, 20, 80, {
            color: '#888888',
            fontSize: 14,
        });

        // Game over overlay
        if (this.isGameOver) {
            renderer.drawScreenRect(
                0,
                0,
                this.screenWidth,
                this.screenHeight,
                'rgba(0, 0, 0, 0.7)'
            );

            renderer.drawText('GAME OVER', this.screenWidth / 2, this.screenHeight / 2 - 30, {
                color: '#ff4757',
                fontSize: 36,
                align: 'center',
            });

            renderer.drawText(
                `Final Score: ${Math.floor(this.score)}`,
                this.screenWidth / 2,
                this.screenHeight / 2 + 20,
                {
                    color: '#ffffff',
                    fontSize: 24,
                    align: 'center',
                }
            );

            renderer.drawText('Tap to restart', this.screenWidth / 2, this.screenHeight / 2 + 70, {
                color: '#888888',
                fontSize: 18,
                align: 'center',
            });
        }
    }

    private handleInput(): void {
        const game = this.getGame();
        if (!game) return;

        const touch = game.touchInput.getPrimaryTouch();

        if (this.isGameOver) {
            // Restart on tap
            if (game.touchInput.justTouched()) {
                this.restart();
            }
            return;
        }

        if (touch) {
            // Move player towards touch position
            const targetX = touch.x;
            const diff = targetX - this.playerSprite.x;
            const speed = 500;

            if (Math.abs(diff) > 5) {
                const direction = diff > 0 ? 1 : -1;
                this.playerSprite.x += direction * speed * Time.delta;
            }

            // Clamp to screen bounds
            const halfSize = this.playerSize / 2;
            this.playerSprite.x = Math.max(
                halfSize,
                Math.min(this.screenWidth - halfSize, this.playerSprite.x)
            );
        }
    }

    private spawnObstacles(): void {
        const currentTime = Time.elapsed;

        if (currentTime - this.lastObstacleTime >= this.obstacleSpawnInterval) {
            this.lastObstacleTime = currentTime;

            // Random X position
            const x = this.obstacleSize / 2 + Math.random() * (this.screenWidth - this.obstacleSize);

            // Create obstacle entity
            const obstacle = this.createEntity('Obstacle');
            obstacle.tag = 'obstacle';

            // Add sprite
            const sprite = obstacle.add(
                new Sprite({
                    x,
                    y: -this.obstacleSize,
                    width: this.obstacleSize,
                    height: this.obstacleSize,
                })
            );
            sprite.centerAnchor();

            // Add collider
            const collider = obstacle.add(Collider.centered(this.obstacleSize, this.obstacleSize));
            collider.setLayer(CollisionLayers.Enemy);
            collider.setMask(CollisionLayers.Player);

            this.obstacles.push(obstacle);

            // Decrease spawn interval as score increases
            this.obstacleSpawnInterval = Math.max(0.5, 2 - this.score / 500);
        }
    }

    private updateObstacles(dt: number): void {
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            const sprite = obstacle.get(Sprite);
            const collider = obstacle.get(Collider);

            if (sprite && collider) {
                // Move down
                sprite.y += this.gameSpeed * dt;

                // Update collider position
                collider.updateFromPosition(
                    sprite.x - this.obstacleSize / 2,
                    sprite.y - this.obstacleSize / 2
                );

                // Remove if off screen
                if (sprite.y > this.screenHeight + this.obstacleSize) {
                    this.destroyEntity(obstacle);
                    this.obstacles.splice(i, 1);
                }
            }
        }
    }

    private checkCollisions(): void {
        for (const obstacle of this.obstacles) {
            const obstacleCollider = obstacle.get(Collider);

            if (obstacleCollider && this.playerCollider.intersects(obstacleCollider)) {
                this.gameOver();
                return;
            }
        }
    }

    private gameOver(): void {
        this.isGameOver = true;
        Logger.info(`Game Over! Score: ${Math.floor(this.score)}`);
    }

    private restart(): void {
        // Remove all obstacles
        for (const obstacle of this.obstacles) {
            this.destroyEntity(obstacle);
        }
        this.obstacles = [];

        // Reset player position
        this.playerSprite.x = this.screenWidth / 2;
        this.playerSprite.y = this.screenHeight - 100;

        // Reset game state
        this.score = 0;
        this.gameSpeed = 200;
        this.obstacleSpawnInterval = 2;
        this.isGameOver = false;
        this.lastObstacleTime = Time.elapsed;

        Logger.info('Game restarted');
    }

    private getGame() {
        // Access the game through a parent reference (simplified)
        // In a real implementation, you'd have a proper reference
        return (globalThis as any).__blazeGame;
    }
}
