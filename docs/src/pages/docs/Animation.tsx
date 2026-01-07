import { CodeBlock } from '../../components/CodeBlock'

export function Animation() {
  return (
    <>
      <h1>Animation</h1>
      <p>Blaze provides sprite sheet animations and tweening for smooth motion.</p>

      <h2>Sprite Sheets</h2>
      <CodeBlock code={`import { SpriteSheet, SpriteAnimation, AnimatedSprite } from 'blaze-engine';

// Define sprite sheet
const sheet = new SpriteSheet({
  image: AssetLoader.getImage('player-sheet'),
  frameWidth: 64,
  frameHeight: 64,
  frameCount: 8
});

// Create animation
const walkAnim = new SpriteAnimation({
  spriteSheet: sheet,
  startFrame: 0,
  endFrame: 7,
  frameDuration: 0.1, // seconds per frame
  loop: true
});

// Use in entity
class Player extends Entity {
  onStart() {
    this.add(new AnimatedSprite({
      x: 100, y: 200,
      animation: walkAnim
    }));
  }
}`} />

      <h2>Animation Modes</h2>
      <CodeBlock code={`type AnimationPlayMode = 
  | 'loop'        // 1,2,3,1,2,3,...
  | 'once'        // 1,2,3 (stop)
  | 'pingpong'    // 1,2,3,2,1,...
  | 'reverse';    // 3,2,1,3,2,1,...`} />

      <h2>Controlling Animation</h2>
      <CodeBlock code={`const anim = this.get(AnimatedSprite);

anim.play();
anim.pause();
anim.stop();       // Reset to frame 0
anim.setFrame(3);  // Jump to frame

// Switch animation
anim.setAnimation(runAnim);`} />

      <h2>Tweens</h2>
      <p>Animate any value smoothly:</p>
      <CodeBlock code={`import { useTween, Easing } from 'blaze-engine';

function AnimatedBox() {
  const [x, setX] = useState(50);

  const { start } = useTween({
    from: 50,
    to: 300,
    duration: 1000, // ms
    easing: Easing.easeOutBounce,
    onUpdate: (value) => setX(value)
  });

  return (
    <SpriteComponent x={x} y={200} width={50} height={50} />
  );
}`} />

      <h2>Easing Functions</h2>
      <CodeBlock code={`import { Easing, getEasing } from 'blaze-engine';

Easing.linear
Easing.easeIn
Easing.easeOut
Easing.easeInOut
Easing.easeInQuad
Easing.easeOutQuad
Easing.easeInCubic
Easing.easeOutCubic
Easing.easeInElastic
Easing.easeOutElastic
Easing.easeOutBounce
// ... and more`} />

      <h2>Tween Sequences</h2>
      <CodeBlock code={`import { useTweenSequence } from 'blaze-engine';

const { start } = useTweenSequence([
  { from: 0, to: 100, duration: 500 },
  { from: 100, to: 50, duration: 300 },
  { from: 50, to: 200, duration: 700 }
], {
  onUpdate: (value) => setX(value),
  onComplete: () => console.log('Done!')
});`} />

      <h2>Spring Animation</h2>
      <CodeBlock code={`import { useSpring } from 'blaze-engine';

const { value, setTarget } = useSpring({
  initial: 100,
  stiffness: 150,
  damping: 15
});

// Animate to new target
setTarget(300);

// Use in render
<SpriteComponent x={value} ... />`} />
    </>
  )
}
