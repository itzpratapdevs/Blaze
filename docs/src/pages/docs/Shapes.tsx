import { CodeBlock } from '../../components/CodeBlock';

export default function ShapesPage() {
    return (
        <article className="docs-content">
            <h1>Shapes & Text</h1>
            <p className="lead">
                Render basic geometric shapes and text on the canvas.
            </p>

            <h2>Rectangle</h2>
            <CodeBlock code={`import { Rectangle } from 'blaze-engine';

<Rectangle
    x={100}
    y={100}
    width={200}
    height={100}
    color="#ff0000"
    radius={10}         // Rounded corners
    strokeColor="#fff"
    strokeWidth={2}
    rotation={Math.PI / 4}
    anchor={{ x: 0.5, y: 0.5 }}
/>`} />

            <h2>Circle</h2>
            <CodeBlock code={`import { Circle } from 'blaze-engine';

<Circle
    x={200}
    y={200}
    radius={50}
    color="#00ff00"
    startAngle={0}
    endAngle={Math.PI}  // Half circle
/>`} />

            <h2>Line</h2>
            <CodeBlock code={`import { Line } from 'blaze-engine';

<Line
    x1={0}
    y1={0}
    x2={100}
    y2={100}
    color="#0000ff"
    width={5}
    dash={[10, 5]}  // Dashed line
/>`} />

            <h2>Polygon</h2>
            <CodeBlock code={`import { Polygon } from 'blaze-engine';

<Polygon
    points={[
        { x: 0, y: -50 },
        { x: 50, y: 50 },
        { x: -50, y: 50 }
    ]}
    x={300}
    y={300}
    color="orange"
/>`} />

            <h2>Text</h2>
            <CodeBlock code={`import { Text } from 'blaze-engine';

<Text
    x={400}
    y={100}
    text="Hello World"
    fontSize={32}
    fontFamily="Arial"
    color="white"
    textAlign="center"   // left, center, right
    textBaseline="middle" // top, middle, bottom
    strokeColor="black"
    strokeWidth={1}
/>`} />
        </article>
    );
}
