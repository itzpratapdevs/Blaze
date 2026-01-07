import { Entity } from './Entity';
import { System, RenderSystem } from './System';
import type { Renderer } from '../rendering/Renderer';
import { Logger } from '../utils/Logger';

/**
 * Scene lifecycle state.
 */
export enum SceneState {
    Unloaded = 'unloaded',
    Loading = 'loading',
    Active = 'active',
    Paused = 'paused',
}

/**
 * Scene class - represents a game state.
 * Examples: MenuScene, PlayScene, GameOverScene
 *
 * Only one scene is active at a time.
 */
export abstract class Scene {
    /**
     * Scene name for debugging.
     */
    public name: string;

    /**
     * Current state of the scene.
     */
    private _state: SceneState = SceneState.Unloaded;

    /**
     * All entities in this scene.
     */
    private _entities: Entity[] = [];

    /**
     * Update systems.
     */
    private _systems: System[] = [];

    /**
     * Render systems.
     */
    private _renderSystems: RenderSystem[] = [];

    /**
     * Systems sorted by priority (cached).
     */
    private _sortedSystems: System[] = [];
    private _systemsDirty: boolean = false;

    constructor(name: string = 'Scene') {
        this.name = name;
    }

    // ===============================
    // Lifecycle hooks (override these)
    // ===============================

    /**
     * Called when the scene starts loading.
     * Use this for async asset loading.
     */
    async onLoad(): Promise<void> { }

    /**
     * Called when the scene becomes active.
     * Use this for initialization after loading.
     */
    onStart(): void { }

    /**
     * Called each frame.
     * Override for custom update logic beyond systems.
     * @param dt Delta time in seconds
     */
    onUpdate(_dt: number): void { }

    /**
     * Called each frame for rendering.
     * Override for custom rendering beyond render systems.
     * @param renderer The renderer instance
     */
    onRender(_renderer: Renderer): void { }

    /**
     * Called when the scene is paused.
     */
    onPause(): void { }

    /**
     * Called when the scene is resumed.
     */
    onResume(): void { }

    /**
     * Called when the scene is being unloaded.
     * Use this for cleanup.
     */
    onUnload(): void { }

    // ===============================
    // State
    // ===============================

    get state(): SceneState {
        return this._state;
    }

    get isActive(): boolean {
        return this._state === SceneState.Active;
    }

    get isPaused(): boolean {
        return this._state === SceneState.Paused;
    }

    get isLoaded(): boolean {
        return this._state !== SceneState.Unloaded && this._state !== SceneState.Loading;
    }

    // ===============================
    // Entity management
    // ===============================

    /**
     * Add an entity to the scene.
     */
    addEntity(entity: Entity): Entity {
        if (!this._entities.includes(entity)) {
            this._entities.push(entity);
            Logger.debug(`Added entity: ${entity.name}`);
        }
        return entity;
    }

    /**
     * Create and add a new entity.
     */
    createEntity(name?: string): Entity {
        const entity = new Entity(name);
        return this.addEntity(entity);
    }

    /**
     * Remove an entity from the scene.
     */
    removeEntity(entity: Entity): boolean {
        const index = this._entities.indexOf(entity);
        if (index !== -1) {
            this._entities.splice(index, 1);
            Logger.debug(`Removed entity: ${entity.name}`);
            return true;
        }
        return false;
    }

    /**
     * Remove and destroy an entity.
     */
    destroyEntity(entity: Entity): boolean {
        if (this.removeEntity(entity)) {
            entity.destroy();
            return true;
        }
        return false;
    }

    /**
     * Get all entities.
     */
    get entities(): readonly Entity[] {
        return this._entities;
    }

    /**
     * Get entity count.
     */
    get entityCount(): number {
        return this._entities.length;
    }

    /**
     * Find an entity by name.
     */
    findEntity(name: string): Entity | undefined {
        return this._entities.find((e) => e.name === name);
    }

    /**
     * Find an entity by ID.
     */
    findEntityById(id: string): Entity | undefined {
        return this._entities.find((e) => e.id === id);
    }

    /**
     * Find entities by tag.
     */
    findEntitiesByTag(tag: string): Entity[] {
        return this._entities.filter((e) => e.tag === tag);
    }

    // ===============================
    // System management
    // ===============================

    /**
     * Add an update system.
     */
    addSystem(system: System): System {
        this._systems.push(system);
        this._systemsDirty = true;
        system.onAdd();
        return system;
    }

    /**
     * Add a render system.
     */
    addRenderSystem(system: RenderSystem): RenderSystem {
        this._renderSystems.push(system);
        this._renderSystems.sort((a, b) => a.priority - b.priority);
        return system;
    }

    /**
     * Remove a system.
     */
    removeSystem(system: System): boolean {
        const index = this._systems.indexOf(system);
        if (index !== -1) {
            system.onRemove();
            this._systems.splice(index, 1);
            this._systemsDirty = true;
            return true;
        }
        return false;
    }

    /**
     * Get sorted systems.
     */
    private getSortedSystems(): System[] {
        if (this._systemsDirty) {
            this._sortedSystems = [...this._systems].sort((a, b) => a.priority - b.priority);
            this._systemsDirty = false;
        }
        return this._sortedSystems;
    }

    // ===============================
    // Internal methods (called by Game)
    // ===============================

    /**
     * @internal Load the scene.
     */
    async _load(): Promise<void> {
        if (this._state !== SceneState.Unloaded) {
            Logger.warn(`Scene ${this.name} is already loaded`);
            return;
        }

        this._state = SceneState.Loading;
        Logger.info(`Loading scene: ${this.name}`);

        await this.onLoad();

        this._state = SceneState.Active;
        this.onStart();
        Logger.info(`Scene active: ${this.name}`);
    }

    /**
     * @internal Update the scene.
     */
    _update(dt: number): void {
        if (this._state !== SceneState.Active) return;

        // Update all systems
        const systems = this.getSortedSystems();
        for (const system of systems) {
            if (system.enabled) {
                system.update(this._entities, dt);
            }
        }

        // Custom update
        this.onUpdate(dt);
    }

    /**
     * @internal Render the scene.
     */
    _render(renderer: Renderer): void {
        if (this._state !== SceneState.Active && this._state !== SceneState.Paused) return;

        // Render systems
        for (const system of this._renderSystems) {
            if (system.enabled) {
                system.render(this._entities);
            }
        }

        // Custom render
        this.onRender(renderer);
    }

    /**
     * @internal Pause the scene.
     */
    _pause(): void {
        if (this._state === SceneState.Active) {
            this._state = SceneState.Paused;
            this.onPause();
            Logger.info(`Scene paused: ${this.name}`);
        }
    }

    /**
     * @internal Resume the scene.
     */
    _resume(): void {
        if (this._state === SceneState.Paused) {
            this._state = SceneState.Active;
            this.onResume();
            Logger.info(`Scene resumed: ${this.name}`);
        }
    }

    /**
     * @internal Unload the scene.
     */
    _unload(): void {
        if (this._state === SceneState.Unloaded) return;

        Logger.info(`Unloading scene: ${this.name}`);

        // Remove all systems
        for (const system of this._systems) {
            system.onRemove();
        }
        this._systems = [];
        this._renderSystems = [];
        this._sortedSystems = [];

        // Destroy all entities
        for (const entity of [...this._entities]) {
            entity.destroy();
        }
        this._entities = [];

        this.onUnload();
        this._state = SceneState.Unloaded;
    }
}
