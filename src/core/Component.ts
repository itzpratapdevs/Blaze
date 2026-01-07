import type { Entity } from './Entity';

/**
 * Base class for all components.
 * Components are pure data containers attached to entities.
 * They should not contain logic - use Systems for that.
 */
export abstract class Component {
    /**
     * The entity this component is attached to.
     * Set automatically when added to an entity.
     */
    private _entity: Entity | null = null;

    /**
     * Whether this component is enabled.
     * Disabled components can be skipped by systems.
     */
    public enabled: boolean = true;

    /**
     * Get the entity this component is attached to.
     */
    get entity(): Entity | null {
        return this._entity;
    }

    /**
     * @internal Called when the component is added to an entity.
     */
    _setEntity(entity: Entity | null): void {
        this._entity = entity;
    }

    /**
     * Called when the component is added to an entity.
     * Override to perform initialization.
     */
    onAttach(): void { }

    /**
     * Called when the component is removed from an entity.
     * Override to perform cleanup.
     */
    onDetach(): void { }

    /**
     * Get a sibling component from the same entity.
     * Convenience method for component interaction.
     */
    getSibling<T extends Component>(type: ComponentType<T>): T | undefined {
        return this._entity?.get(type);
    }

    /**
     * Check if the entity has a sibling component.
     */
    hasSibling<T extends Component>(type: ComponentType<T>): boolean {
        return this._entity?.has(type) ?? false;
    }
}

/**
 * Type helper for component class references.
 */
export interface ComponentType<T extends Component = Component> {
    new(...args: unknown[]): T;
}
