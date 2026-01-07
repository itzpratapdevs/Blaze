import { CodeBlock } from '../../../components/CodeBlock'

export function UseGameHook() {
    return (
        <>
            <h1>useGame</h1>
            <p>Create and manage a Game instance using React hooks.</p>

            <h2>Import</h2>
            <CodeBlock code={`import { useGame } from 'blaze-engine';`} />

            <h2>Usage</h2>
            <CodeBlock code={`function MyGame() {
  const { game, start, stop, pause, resume } = useGame({
    width: 360,
    height: 640,
    backgroundColor: '#000000',
    targetFPS: 60,
    debug: false
  });

  return <BlazeCanvas game={game} />;
}`} />

            <h2>Config Options</h2>
            <table>
                <thead>
                    <tr>
                        <th>Option</th>
                        <th>Type</th>
                        <th>Default</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><code>width</code></td>
                        <td>number</td>
                        <td>required</td>
                        <td>Game world width in pixels</td>
                    </tr>
                    <tr>
                        <td><code>height</code></td>
                        <td>number</td>
                        <td>required</td>
                        <td>Game world height in pixels</td>
                    </tr>
                    <tr>
                        <td><code>backgroundColor</code></td>
                        <td>string</td>
                        <td>#000000</td>
                        <td>Background color (hex)</td>
                    </tr>
                    <tr>
                        <td><code>targetFPS</code></td>
                        <td>number</td>
                        <td>60</td>
                        <td>Target frames per second</td>
                    </tr>
                    <tr>
                        <td><code>debug</code></td>
                        <td>boolean</td>
                        <td>false</td>
                        <td>Show debug overlay</td>
                    </tr>
                </tbody>
            </table>

            <h2>Return Value</h2>
            <CodeBlock code={`{
  game: Game,           // The Game instance
  start: () => void,    // Start the game loop
  stop: () => void,     // Stop the game completely
  pause: () => void,    // Pause (loop runs, updates skip)
  resume: () => void    // Resume from pause
}`} />

            <h2>Accessing Game Properties</h2>
            <CodeBlock code={`const { game } = useGame({...});

// Read-only properties
game.width          // Game width
game.height         // Game height
game.camera         // Camera instance
game.touchInput     // TouchInput instance
game.isRunning      // Is game running?
game.isPaused       // Is game paused?`} />

            <h2>useGameState</h2>
            <p>Get reactive game state that triggers re-renders:</p>
            <CodeBlock code={`import { useGameState } from 'blaze-engine';

function GameUI() {
  const { isRunning, isPaused } = useGameState(game);
  
  return (
    <View>
      <Text>Running: {isRunning ? 'Yes' : 'No'}</Text>
      <Text>Paused: {isPaused ? 'Yes' : 'No'}</Text>
    </View>
  );
}`} />
        </>
    )
}
