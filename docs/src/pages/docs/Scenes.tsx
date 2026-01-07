import { CodeBlock } from '../../components/CodeBlock'

export function Scenes() {
  return (
    <>
      <h1>Scenes</h1>
      <p>Scenes are containers for your game logic. Each scene has its own lifecycle: load, start, update, render, unload.</p>

      <h2>Creating a Scene</h2>
      <CodeBlock code={`import { Scene, Entity, Renderer } from 'blaze-engine';

class MainMenuScene extends Scene {
  async onLoad() {
    // Load assets, called once
    await AssetLoader.loadImages([...]);
  }

  onStart() {
    // Scene is now active
    this.createButtons();
  }

  onUpdate(dt: number) {
    // Called every frame
  }

  onRender(renderer: Renderer) {
    // Draw your scene
    renderer.drawText('Main Menu', 180, 100);
  }

  onPause() {
    // Scene paused
  }

  onResume() {
    // Scene resumed
  }

  onUnload() {
    // Cleanup
  }
}`} />

      <h2>Scene Lifecycle</h2>
      <CodeBlock code={`onLoad()    → Load assets (async)
onStart()   → Scene becomes active
onUpdate()  → Every frame
onRender()  → Draw to canvas
onPause()   → Game paused
onResume()  → Game resumed  
onUnload()  → Scene removed`} language="text" />

      <h2>Switching Scenes</h2>
      <CodeBlock code={`const game = new Game({ width: 360, height: 640 });

// Set initial scene
await game.setScene(new MainMenuScene());

// Switch to gameplay
await game.setScene(new GameplayScene());

// Back to menu
await game.setScene(new MainMenuScene());`} />

      <h2>Scene with Entities</h2>
      <CodeBlock code={`class GameplayScene extends Scene {
  private player!: Entity;
  private enemies: Entity[] = [];

  onStart() {
    // Add entities
    this.player = this.addEntity(new Player());
    
    for (let i = 0; i < 5; i++) {
      this.enemies.push(this.addEntity(new Enemy()));
    }
  }

  onUpdate(dt: number) {
    // Entities update automatically via systems
  }
}`} />
    </>
  )
}
