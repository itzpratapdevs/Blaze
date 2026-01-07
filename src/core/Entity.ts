import { Component, ComponentType } from './Component';

// Simple ID generator (no crypto, no uuid dependency)
let entityIdCounter = 0;
function generateId(): string {
    return `entity_${++entityIdCounter}`;
}

/**
 * Entity class - a container for components.
 * Entities are the game objects in your scene.
 */
export class Entity {
    /**
     * Unique identifier for this entity.
     */
    public readonly id: string;

    /**
     * Optional name for debugging.
     */
    public name: string;

    /**
     * Whether this entity is active.
     * Inactive entities are skipped by systems.
     */
    public active: boolean = true;

    /**
     * Tag for grouping entities.
     */
    public tag: string = '';

    /**
     * Components attached to this entity.
     */
    private _components: Map<ComponentType, Component> = new Map();

    /**
     * Parent entity (for hierarchies).
     */
    private _parent: Entity | null = null;

    /**
     * Child entities.
     */
    private _children: Entity[] = [];

    constructor(name: string = '') {
        this.id = generateId();
        this.name = name || this.id;
    }

    // ===============================
    // Component management
    // ===============================

    /**
     * Add a component to this entity.
     * Returns the component for chaining.
     */
    add<T extends Component>(component: T): T {
        const type = component.constructor as ComponentType<T>;

        // Remove existing component of same type
        if (this._components.has(type)) {
            this.remove(type);
        }

        component._setEntity(this);
        this._components.set(type, component);
        component.onAttach();

        return component;
    }

    /**
     * Get a component by type.
     */
    get<T extends Component>(type: ComponentType<T>): T | undefined {
        return this._components.get(type) as T | undefined;
    }

    /**
     * Get a component by type, throwing if not found.
     */
    require<T extends Component>(type: ComponentType<T>): T {
        const component = this.get(type);
        if (!component) {
            throw new Error(`Entity '${this.name}' missing required component: ${type.name}`);
        }
        return component;
    }

    /**
     * Check if entity has a component of given type.
     */
    has<T extends Component>(type: ComponentType<T>): boolean {
        return this._components.has(type);
    }

    /**
     * Check if entity has all of the given component types.
     */
    hasAll(...types: ComponentType[]): boolean {
        return types.every((type) => this._components.has(type));
    }

    /**
     * Check if entity has any of the given component types.
     */
    hasAny(...types: ComponentType[]): boolean {
        return types.some((type) => this._components.has(type));
    }

    /**
     * Remove a component by type.
     */
    remove<T extends Component>(type: ComponentType<T>): boolean {
        const component = this._components.get(type);
        if (component) {
            component.onDetach();
            component._setEntity(null);
            this._components.delete(type);
            return true;
        }
        return false;
    }

    /**
     * Remove all components.
     */
    removeAll(): void {
        this._components.forEach((component) => {
            component.onDetach();
            component._setEntity(null);
        });
        this._components.clear();
    }

    /**
     * Get all components.
     */
    getComponents(): Component[] {
        return Array.from(this._components.values());
    }

    /**
     * Get the number of components.
     */
    get componentCount(): number {
        return this._components.size;
    }

    /**
     * Get a component by class name (string).
     * Useful when you can't use the class reference directly.
     */
    getByName<T extends Component>(name: string): T | undefined {
        for (const [type, component] of this._components) {
            if (type.name === name) {
                return component as T;
            }
        }
        return undefined;
    }

    // ===============================
    // Hierarchy
    // ===============================

    /**
     * Get the parent entity.
     */
    get parent(): Entity | null {
        return this._parent;
    }

    /**
     * Get child entities.
     */
    get children(): readonly Entity[] {
        return this._children;
    }

    /**
     * Add a child entity.
     */
    addChild(child: Entity): Entity {
        if (child._parent === this) return child;

        // Remove from previous parent
        if (child._parent) {
            child._parent.removeChild(child);
        }

        child._parent = this;
        this._children.push(child);

        return child;
    }

    /**
     * Remove a child entity.
     */
    removeChild(child: Entity): boolean {
        const index = this._children.indexOf(child);
        if (index !== -1) {
            this._children.splice(index, 1);
            child._parent = null;
            return true;
        }
        return false;
    }

    /**
     * Remove all children.
     */
    removeAllChildren(): void {
        for (const child of this._children) {
            child._parent = null;
        }
        this._children = [];
    }

    /**
     * Find a child by name.
     */
    findChild(name: string): Entity | undefined {
        return this._children.find((c) => c.name === name);
    }

    /**
     * Find a child by tag.
     */
    findChildByTag(tag: string): Entity | undefined {
        return this._children.find((c) => c.tag === tag);
    }

    /**
     * Get all children with a specific tag.
     */
    findChildrenByTag(tag: string): Entity[] {
        return this._children.filter((c) => c.tag === tag);
    }

    // ===============================
    // Lifecycle
    // ===============================

    /**
     * Destroy this entity and all its children.
     */
    destroy(): void {
        // Destroy children first
        for (const child of [...this._children]) {
            child.destroy();
        }

        // Remove from parent
        if (this._parent) {
            this._parent.removeChild(this);
        }

        // Remove all components
        this.removeAll();
    }

    toString(): string {
        return `Entity(${this.name}, components: ${this.componentCount})`;
    }
}

/**
 * Reset the entity ID counter.
 * Useful for testing.
 * @internal
 */
export function _resetEntityIdCounter(): void {
    entityIdCounter = 0;
}
