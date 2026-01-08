import { CodeBlock } from '../../components/CodeBlock';

export default function AudioPage() {
    return (
        <article className="docs-content">
            <h1>Audio</h1>
            <p className="lead">
                Play sound effects and background music.
            </p>

            <h2>useAudio Hook</h2>
            <CodeBlock code={`import { useAudio } from 'blaze-engine';

function Game() {
    // Background Music
    useAudio('/music.mp3', {
        autoplay: true,
        loop: true,
        volume: 0.5
    });

    return <Player />;
}

function Player() {
    // Sound Effect
    const jumpSfx = useAudio('/jump.wav', { volume: 0.8 });
    
    const jump = () => {
        jumpSfx.play();
    };

    return <Button onPress={jump} label="Jump" />;
}`} />

            <h2>Common Methods</h2>
            <ul>
                <li><code>play()</code> - Play the sound</li>
                <li><code>stop()</code> - Stop playback</li>
                <li><code>pause()</code> - Pause playback</li>
                <li><code>seek(time)</code> - Jump to time in seconds</li>
                <li><code>setVolume(0-1)</code> - Adjust volume</li>
            </ul>
        </article>
    );
}
