import { CodeBlock } from '../../components/CodeBlock';

export default function ParallaxPage() {
    return (
        <article className="docs-content">
            <h1>Parallax & Backgrounds</h1>
            <p className="lead">
                Create depth with multi-layered parallax scrolling and infinite tiled backgrounds.
            </p>

            <h2>Tiled Background</h2>
            <p>Perfect for repeating patterns like stars, grass, or grids.</p>
            <CodeBlock code={`import { TiledBackground } from 'blaze-engine';

<TiledBackground
    src="/stars.png"
    scrollX={50}      // Auto-scroll speed X
    scrollY={20}      // Auto-scroll speed Y
    scale={2}
    opacity={0.8}
/>`} />

            <h2>Parallax System</h2>
            <p>Create depth by moving layers at different speeds relative to the camera.</p>
            <CodeBlock code={`import { Parallax, ParallaxLayer } from 'blaze-engine';

function Game() {
    const camera = useCamera();
    
    return (
        <>
            {/* Background - moves slow (factor 0.1) */}
            <Parallax camera={camera} factor={0.1}>
                <Sprite src="/mountains.png" x={0} y={300} />
                <Sprite src="/mountains.png" x={800} y={300} />
            </Parallax>
            
            {/* Midground - moves normal (factor 0.5) */}
            <Parallax camera={camera} factor={0.5}>
                <Sprite src="/trees.png" x={100} y={400} />
                <Sprite src="/trees.png" x={500} y={400} />
            </Parallax>
            
            {/* Foreground - moves fast (factor 1.2) */}
            <Parallax camera={camera} factor={1.2}>
                <Sprite src="/bush.png" x={200} y={500} />
            </Parallax>
        </>
    );
}`} />
        </article>
    );
}
