import { CodeBlock } from '../../../components/CodeBlock';

export default function UIComponentsPage() {
    return (
        <article className="docs-content">
            <h1>UI Components</h1>
            <p className="lead">
                Built-in components for game interfaces, menus, and HUDs.
            </p>

            <h2>Button</h2>
            <CodeBlock code={`import { Button } from 'blaze-engine';

<Button
    x={400}
    y={300}
    width={200}
    height={60}
    label="START GAME"
    labelColor="white"
    color="#4CAF50"
    pressedColor="#388E3C"
    onPress={() => startGame()}
    radius={8}
/>`} />

            <h2>ProgressBar</h2>
            <p>Great for health bars, loading screens, or stamina.</p>
            <CodeBlock code={`<ProgressBar
    x={50}
    y={50}
    width={300}
    height={30}
    value={health}       // Current value
    maxValue={100}       // Max value
    fillColor={['#ff0000', '#ffff00', '#00ff00']} // Gradient!
    backgroundColor="#333"
    borderColor="#fff"
    borderWidth={2}
    radius={15}
    animated={true}      // Smooth transitions
/>`} />

            <h2>NineSlice</h2>
            <p>Scalable panels that don't distort corners.</p>
            <CodeBlock code={`<NineSlice
    src="/panel_bg.png"
    x={100}
    y={100}
    width={400}
    height={300}
    // Define the slice insets (top, right, bottom, left)
    slices={[20, 20, 20, 20]} 
>
    <Text x={20} y={20} text="Menu Content" />
</NineSlice>`} />
        </article>
    );
}
