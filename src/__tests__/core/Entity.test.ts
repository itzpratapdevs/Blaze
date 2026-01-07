import { Entity, _resetEntityIdCounter } from '../../core/Entity';
import { Component } from '../../core/Component';

// Test component
class TestComponent extends Component {
    public value: number = 0;
}

class AnotherComponent extends Component {
    public name: string = '';
}

describe('Entity', () => {
    beforeEach(() => {
        _resetEntityIdCounter();
    });

    describe('constructor', () => {
        it('should create with unique ID', () => {
            const e1 = new Entity();
            const e2 = new Entity();
            expect(e1.id).not.toBe(e2.id);
        });

        it('should use provided name', () => {
            const entity = new Entity('Player');
            expect(entity.name).toBe('Player');
        });
    });

    describe('components', () => {
        it('should add component', () => {
            const entity = new Entity();
            const component = new TestComponent();
            entity.add(component);
            expect(entity.has(TestComponent)).toBe(true);
        });

        it('should get component', () => {
            const entity = new Entity();
            const component = new TestComponent();
            component.value = 42;
            entity.add(component);

            const retrieved = entity.get(TestComponent);
            expect(retrieved).toBe(component);
            expect(retrieved?.value).toBe(42);
        });

        it('should return undefined for missing component', () => {
            const entity = new Entity();
            expect(entity.get(TestComponent)).toBeUndefined();
        });

        it('should remove component', () => {
            const entity = new Entity();
            entity.add(new TestComponent());
            expect(entity.has(TestComponent)).toBe(true);

            entity.remove(TestComponent);
            expect(entity.has(TestComponent)).toBe(false);
        });

        it('should check hasAll', () => {
            const entity = new Entity();
            entity.add(new TestComponent());
            entity.add(new AnotherComponent());

            expect(entity.hasAll(TestComponent, AnotherComponent)).toBe(true);
            expect(entity.hasAll(TestComponent)).toBe(true);
        });

        it('should check hasAny', () => {
            const entity = new Entity();
            entity.add(new TestComponent());

            expect(entity.hasAny(TestComponent, AnotherComponent)).toBe(true);
            expect(entity.hasAny(AnotherComponent)).toBe(false);
        });

        it('should replace existing component of same type', () => {
            const entity = new Entity();
            const c1 = new TestComponent();
            c1.value = 1;
            const c2 = new TestComponent();
            c2.value = 2;

            entity.add(c1);
            entity.add(c2);

            expect(entity.get(TestComponent)?.value).toBe(2);
            expect(entity.componentCount).toBe(1);
        });
    });

    describe('hierarchy', () => {
        it('should add child', () => {
            const parent = new Entity('Parent');
            const child = new Entity('Child');

            parent.addChild(child);

            expect(parent.children.length).toBe(1);
            expect(child.parent).toBe(parent);
        });

        it('should remove child', () => {
            const parent = new Entity('Parent');
            const child = new Entity('Child');

            parent.addChild(child);
            parent.removeChild(child);

            expect(parent.children.length).toBe(0);
            expect(child.parent).toBeNull();
        });

        it('should find child by name', () => {
            const parent = new Entity('Parent');
            const child = new Entity('Child');
            parent.addChild(child);

            expect(parent.findChild('Child')).toBe(child);
            expect(parent.findChild('NotFound')).toBeUndefined();
        });
    });

    describe('lifecycle', () => {
        it('should call onAttach when adding component', () => {
            const entity = new Entity();
            const component = new TestComponent();
            let attached = false;
            component.onAttach = () => { attached = true; };

            entity.add(component);
            expect(attached).toBe(true);
        });

        it('should call onDetach when removing component', () => {
            const entity = new Entity();
            const component = new TestComponent();
            let detached = false;
            component.onDetach = () => { detached = true; };

            entity.add(component);
            entity.remove(TestComponent);
            expect(detached).toBe(true);
        });

        it('should destroy entity and children', () => {
            const parent = new Entity('Parent');
            const child = new Entity('Child');
            parent.addChild(child);
            child.add(new TestComponent());

            parent.destroy();

            expect(parent.componentCount).toBe(0);
            expect(parent.children.length).toBe(0);
        });
    });
});
