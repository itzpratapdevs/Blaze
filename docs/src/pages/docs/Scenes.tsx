import { CodeBlock } from '../../components/CodeBlock';

export default function Scenes() {
  return (
    <article className="docs-content">
      <h1>Scene Management</h1>
      <p className="lead">
        Organize your game into different screens like Menu, Level, and Game Over.
      </p>

      <h2>Setup</h2>
      <CodeBlock code={`import { BlazeGame, SceneManager, Scene } from 'blaze-engine';

function App() {
    return (
        <BlazeGame width={800} height={600}>
            <SceneManager initialScene="menu">
                <Scene name="menu">
                    <MenuScreen />
                </Scene>
                <Scene name="game">
                    <GameScreen />
                </Scene>
                <Scene name="gameover">
                    <GameOverScreen />
                </Scene>
            </SceneManager>
        </BlazeGame>
    );
}`} />

      <h2>Switching Scenes</h2>
      <p>Use the <code>useSceneManager</code> hook to navigate.</p>
      <CodeBlock code={`import { useSceneManager, Button } from 'blaze-engine';

function MenuScreen() {
    const { setScene } = useSceneManager();
    
    return (
        <Button 
            label="Start Game" 
            onPress={() => setScene('game')} 
        />
    );
}

function GameScreen() {
    const { setScene } = useSceneManager();
    
    const endGame = () => {
        setScene('gameover', { score: 1000 }); // Pass data
    };
    
    // ... game logic
}

function GameOverScreen() {
    const { setScene, sceneData } = useSceneManager();
    
    return (
        <>
            <Text text={\`Score: \${sceneData?.score}\`} />
            <Button label="Retry" onPress={() => setScene('game')} />
        </>
    );
}`} />
    </article>
  );
}
