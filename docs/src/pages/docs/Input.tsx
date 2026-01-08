import { CodeBlock } from '../../components/CodeBlock';

export default function InputPage() {
    return (
        <article className="docs-content">
            <h1>Input Handling</h1>
            <p className="lead">
                Unified input hook for keyboard, mouse, and touch interactions.
            </p>

            <h2>useInput Hook</h2>
            <CodeBlock code={`import { useInput, useGameLoop } from 'blaze-engine';

function Player() {
    const input = useInput();
    
    useGameLoop(() => {
        // Keyboard (WASD or Arrows)
        if (input.isKeyDown('ArrowRight') || input.isKeyDown('d')) {
            moveRight();
        }
        
        // Check for specific key press (once)
        if (input.justPressed('Space')) {
            jump();
        }
        
        // Mouse / Touch Position
        const { x, y } = input.position;
        
        // Mouse Click / Touch Tap
        if (input.isPressed) {
            shootAt(x, y);
        }
    });
}`} />

            <h2>Input Properties</h2>
            <table className="docs-table">
                <thead>
                    <tr>
                        <th>Property</th>
                        <th>Type</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>isKeyDown(key)</td><td>function</td><td>Returns true if key is held down</td></tr>
                    <tr><td>isKeyPressed(key)</td><td>function</td><td>Returns true same as isKeyDown</td></tr>
                    <tr><td>justPressed(key)</td><td>function</td><td>Returns true only on first frame of press</td></tr>
                    <tr><td>position</td><td>Vector2</td><td>Current mouse/touch coordinates</td></tr>
                    <tr><td>isPressed</td><td>boolean</td><td>True if mouse button or touch is active</td></tr>
                </tbody>
            </table>
        </article>
    );
}
