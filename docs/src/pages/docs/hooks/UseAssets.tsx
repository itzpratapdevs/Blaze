import { CodeBlock } from '../../../components/CodeBlock'

export function UseAssetsHook() {
  return (
    <>
      <h1>useAssets</h1>
      <p>Load and manage game assets (images, sounds).</p>

      <h2>Import</h2>
      <CodeBlock code={`import { useAssets, useImage } from 'blaze-engine';`} />

      <h2>useAssets</h2>
      <p>Load multiple assets with progress tracking:</p>
      <CodeBlock code={`function Game() {
  const { isLoading, progress, error } = useAssets([
    { key: 'player', uri: require('./assets/player.png') },
    { key: 'enemy', uri: require('./assets/enemy.png') },
    { key: 'background', uri: require('./assets/bg.png') },
  ]);

  if (isLoading) {
    return <LoadingScreen progress={progress} />;
  }

  if (error) {
    return <ErrorScreen message={error.message} />;
  }

  return <GameScreen />;
}`} />

      <h3>Return Value</h3>
      <CodeBlock code={`{
  isLoading: boolean,   // Are assets still loading?
  progress: number,     // 0 to 1 progress
  error: Error | null,  // Loading error if any
  assets: Map           // Loaded assets
}`} />

      <h2>useImage</h2>
      <p>Load a single image:</p>
      <CodeBlock code={`function Player() {
  const { image, isLoading } = useImage('player', require('./player.png'));

  if (isLoading || !image) return null;

  return (
    <SpriteComponent
      image={image}
      x={100}
      y={200}
      width={64}
      height={64}
    />
  );
}`} />

      <h2>AssetLoader (Class API)</h2>
      <p>For ECS architecture, use the static AssetLoader:</p>
      <CodeBlock code={`import { AssetLoader } from 'blaze-engine';

// In Scene.onLoad()
async onLoad() {
  await AssetLoader.loadImages([
    { key: 'player', uri: require('./player.png') },
    { key: 'enemy', uri: require('./enemy.png') },
  ]);
}

// Get loaded image
const playerImage = AssetLoader.getImage('player');

// Check if loaded
if (AssetLoader.isLoaded('player')) { ... }

// Unload when done
AssetLoader.remove('player');
AssetLoader.clear(); // Remove all`} />

      <h2>Asset Types</h2>
      <CodeBlock code={`// Image asset
{ key: 'player', uri: require('./player.png'), type: 'image' }

// Remote image
{ key: 'avatar', uri: 'https://example.com/avatar.png', type: 'image' }

// Audio (requires expo-av)
{ key: 'jump', uri: require('./jump.mp3'), type: 'audio' }`} />
    </>
  )
}
