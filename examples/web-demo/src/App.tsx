import React, { useState } from 'react'
import { BlazeCanvas, useGame, useGameLoop, useTouch, SpriteComponent } from 'blaze-engine'

function App() {
  const { game } = useGame({ width: window.innerWidth, height: window.innerHeight })
  const [playerX, setPlayerX] = useState(100)
  const [playerY, setPlayerY] = useState(100)
  const { isTouching, x: touchX, y: touchY } = useTouch()

  useGameLoop((dt) => {
    // Simple lerp to touch position
    if (isTouching) {
      setPlayerX(prev => prev + (touchX - prev) * 5 * dt)
      setPlayerY(prev => prev + (touchY - prev) * 5 * dt)
    }
  })

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#111' }}>
      <BlazeCanvas game={game}>
        <SpriteComponent
          source={{ uri: 'https://raw.githubusercontent.com/blaze-engine/blaze/main/assets/demo.gif' }} // Using a placeholder image or I should use a local one
          // Actually, let's use a simple colored rect logic if Sprite fails, but SpriteComponent expects source.
          // I'll assume SpriteComponent handles web images correctly (HTMLImageElement or CanvasImageSource).
          x={playerX}
          y={playerY}
          width={64}
          height={64}
        />
        {/* Debug Text */}
      </BlazeCanvas>
      <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', fontFamily: 'monospace' }}>
        <h2>Blaze Engine Web Demo</h2>
        <p>Touch/Click and drag to move</p>
        <p>Pos: {Math.round(playerX)}, {Math.round(playerY)}</p>
      </div>
    </div>
  )
}

export default App
