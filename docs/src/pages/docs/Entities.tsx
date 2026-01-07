import { CodeBlock } from '../../components/CodeBlock'

export function Entities() {
  return (
    <>
      <h1>Entities</h1>
      <p>Entities are game objects that hold Components. They're the building blocks of your game in the ECS architecture.</p>

      <h2>Creating an Entity</h2>
      <CodeBlock code={`import { Entity, Sprite, Collider } from 'blaze-engine';

class Player extends Entity {
  private speed = 200;

  onStart() {
    // Add components
    this.add(new Sprite({
      x: 100,
      y: 200,
      width: 64,
      height: 64,
      color: '#f97316'
    }));

    this.add(new Collider({
      width: 64,
      height: 64,
      layer: 'player'
    }));
  }

  onUpdate(dt: number) {
    const sprite = this.get(Sprite);
    sprite.x += this.speed * dt;
  }
}`} />

      <h2>Entity Lifecycle</h2>
      <CodeBlock code={`onStart()   → Entity added to scene
onUpdate()  → Every frame (if active)
onDestroy() → Entity removed`} language="text" />

      <h2>Managing Components</h2>
      <CodeBlock code={`// Add component
this.add(new Sprite({...}));

// Get component by type
const sprite = this.get(Sprite);

// Get by name (dynamic lookup)
const collider = this.getByName<Collider>('Collider');

// Check if has component
if (this.has(Sprite)) { ... }

// Remove component
this.remove(Sprite);`} />

      <h2>Entity Hierarchy</h2>
      <CodeBlock code={`// Parent-child relationships
const parent = new Entity();
const child = new Entity();

parent.addChild(child);
child.parent; // → parent

// Children follow parent transforms
parent.get(Sprite).x = 100;
// child is offset from parent`} />

      <h2>Destroying Entities</h2>
      <CodeBlock code={`// Mark for destruction
entity.destroy();

// Check if marked
if (entity.isDestroyed) { ... }

// In Scene, remove:
this.removeEntity(entity);`} />

      <h2>Tags and Names</h2>
      <CodeBlock code={`const player = new Player();
player.name = 'player';
player.tags.add('damageable');

// Find by name
const found = scene.findByName('player');

// Find by tag
const damageables = scene.findByTag('damageable');`} />
    </>
  )
}
