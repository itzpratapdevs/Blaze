import { CodeBlock } from '../../components/CodeBlock';

export default function RigidbodyPage() {
    return (
        <article className="docs-content">
            <h1>Rigidbody Physics</h1>
            <p className="lead">
                Add physics properties like gravity, velocity, and bounce to entities.
            </p>

            <h2>Basic Usage</h2>
            <CodeBlock code={`import { Rigidbody, Sprite } from 'blaze-engine';

<Rigidbody
    x={100}
    y={0}
    gravity={800}        // Pixels per second squared
    bounce={0.5}         // Bounciness (0-1)
    drag={0.1}           // Air resistance
    velocityX={100}
>
    <Sprite src="/ball.png" />
</Rigidbody>`} />

            <h2>Using Physics State</h2>
            <p>Access and control the rigidbody from child components:</p>
            <CodeBlock code={`function Player() {
    const body = useRigidbody();
    const input = useInput();
    
    useGameLoop(() => {
        if (!body) return;
        
        if (input.justPressed('Space')) {
            // Apply instant force (jump)
            body.applyImpulse(0, -500);
        }
        
        if (input.isKeyDown('ArrowRight')) {
            // Apply continuous force
            body.applyForce(1000, 0);
        }
    });
    
    return <Sprite src="/player.png" />;
}`} />

            <h2>Props Reference</h2>
            <table className="docs-table">
                <thead>
                    <tr>
                        <th>Prop</th>
                        <th>Type</th>
                        <th>Default</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>gravity</td><td>number</td><td>0</td><td>Vertical acceleration</td></tr>
                    <tr><td>mass</td><td>number</td><td>1</td><td>Mass affects force calculation</td></tr>
                    <tr><td>bounce</td><td>number</td><td>0</td><td>Restitution (0-1)</td></tr>
                    <tr><td>drag</td><td>number</td><td>0</td><td>Velocity decay (0-1)</td></tr>
                    <tr><td>kinematic</td><td>boolean</td><td>false</td><td>If true, physics are manual</td></tr>
                </tbody>
            </table>
        </article>
    );
}
