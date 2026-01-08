import { CodeBlock } from '../../components/CodeBlock';

export default function ParticlesPage() {
    return (
        <article className="docs-content">
            <h1>Particle System</h1>
            <p className="lead">
                Create advanced visual effects like fire, smoke, rain, and explosions.
            </p>

            <h2>Basic Usage</h2>
            <CodeBlock code={`import { ParticleSystem } from 'blaze-engine';

<ParticleSystem
    x={400}
    y={300}
    active={true}
    emissionRate={50}     // Particles per second
    maxParticles={200}
    
    // Properties can be ranges (min/max)
    lifespan={{ min: 1, max: 2 }}
    speed={{ min: 100, max: 200 }}
    angle={{ min: 0, max: 360 }}
    size={{ start: 20, end: 0 }}
    
    // Colors fade over lifetime
    colors={['#ff0000', '#ffff00', '#00000000']}
    
    // Physics
    gravity={{ x: 0, y: 500 }}
    blendMode="source-over" // or "lighter" for fire
/>`} />

            <h2>Explosion Effect</h2>
            <CodeBlock code={`function Explosion({ x, y }) {
    return (
        <ParticleSystem
            x={x}
            y={y}
            active={false}       // Use burst mode if implemented or manage active state
            burst={50}           // Emit 50 particles at once
            lifespan={0.5}
            speed={{ min: 100, max: 400 }}
            colors={['orange', 'red', 'gray']}
        />
    );
}`} />
        </article>
    );
}
