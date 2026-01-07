import { Entity } from './Entity';
import { ComponentType } from './Component';

/**
 * Base class for systems.
 * Systems contain the logic that operates on entities with specific components.
 */
export abstract class System {
    /**
     * Priority for system execution order.
     * Lower values run first.
     */
    public priority: number = 0;

    /**
     * Whether this system is enabled.
     */
    public enabled: boolean = true;

    /**
     * The component types this system requires on entities.
     * Override this to filter entities.
     */
    protected requiredComponents: ComponentType[] = [];

    /**
     * Called once when the system is added to a scene.
     */
    onAdd(): void { }

    /**
     * Called once when the system is removed from a scene.
     */
    onRemove(): void { }

    /**
     * Called each frame with all entities.
     * Override this to implement custom logic.
     * @param entities All entities in the scene
     * @param dt Delta time in seconds
     */
    abstract update(entities: readonly Entity[], dt: number): void;

    /**
     * Filter entities to only those with required components.
     * Use this helper in your update method.
     */
    protected filterEntities(entities: readonly Entity[]): Entity[] {
        if (this.requiredComponents.length === 0) {
            return entities.filter((e) => e.active);
        }

        return entities.filter(
            (entity) => entity.active && entity.hasAll(...this.requiredComponents)
        );
    }

    /**
     * Get entities with a specific component.
     */
    protected getEntitiesWith<T extends ComponentType>(
        entities: readonly Entity[],
        component: T
    ): Entity[] {
        return entities.filter((entity) => entity.active && entity.has(component));
    }

    /**
     * Get entities with a specific tag.
     */
    protected getEntitiesByTag(entities: readonly Entity[], tag: string): Entity[] {
        return entities.filter((entity) => entity.active && entity.tag === tag);
    }
}

/**
 * A simple render system base class.
 * Render systems should extend this instead of System.
 */
export abstract class RenderSystem {
    public priority: number = 0;
    public enabled: boolean = true;

    abstract render(entities: readonly Entity[]): void;
}
