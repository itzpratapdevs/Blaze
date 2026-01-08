import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Landing } from './pages/Landing'
import { DocsLayout } from './layouts/DocsLayout'
import { GettingStarted } from './pages/docs/GettingStarted'
import { Installation } from './pages/docs/Installation'
import { QuickStart } from './pages/docs/QuickStart'
import { GameLoop } from './pages/docs/GameLoop'
import Scenes from './pages/docs/Scenes'
import { Entities } from './pages/docs/Entities'
import { Sprites } from './pages/docs/Sprites'
import { Animation } from './pages/docs/Animation'

// Corrected Imports
import CameraPage from './pages/docs/Camera'
import TilemapPage from './pages/docs/Tilemap'
import CollisionPage from './pages/docs/Collision'
import JoystickPage from './pages/docs/ui/Joystick'
import ShapesPage from './pages/docs/Shapes'
import ParallaxPage from './pages/docs/Parallax'
import ParticlesPage from './pages/docs/Particles'
import RigidbodyPage from './pages/docs/Rigidbody'
import UIComponentsPage from './pages/docs/ui/Components'
import InputPage from './pages/docs/Input'
import AudioPage from './pages/docs/Audio'

import SpaceShooterExample from './pages/docs/examples/SpaceShooter'
import PlatformerExample from './pages/docs/examples/Platformer'
import EndlessRunnerExample from './pages/docs/examples/EndlessRunner'
import { UseGameHook } from './pages/docs/hooks/UseGame'
import { UseGameLoopHook } from './pages/docs/hooks/UseGameLoop'
import { UseAssetsHook } from './pages/docs/hooks/UseAssets'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/docs" element={<DocsLayout />}>
          {/* Getting Started */}
          <Route index element={<GettingStarted />} />
          <Route path="installation" element={<Installation />} />
          <Route path="quickstart" element={<QuickStart />} />

          {/* Core Concepts */}
          <Route path="game-loop" element={<GameLoop />} />
          <Route path="scenes" element={<Scenes />} />
          <Route path="entities" element={<Entities />} />

          {/* Rendering */}
          <Route path="sprites" element={<Sprites />} />
          <Route path="components/shapes" element={<ShapesPage />} />
          <Route path="components/text" element={<ShapesPage />} />
          <Route path="animation" element={<Animation />} />
          <Route path="camera" element={<CameraPage />} />
          <Route path="parallax" element={<ParallaxPage />} />
          <Route path="particles" element={<ParticlesPage />} />

          {/* World & Physics */}
          <Route path="tilemap" element={<TilemapPage />} />
          <Route path="rigidbody" element={<RigidbodyPage />} />
          <Route path="collision" element={<CollisionPage />} />

          {/* UI Components */}
          <Route path="ui/joystick" element={<JoystickPage />} />
          <Route path="ui/button" element={<UIComponentsPage />} />
          <Route path="ui/progress-bar" element={<UIComponentsPage />} />
          <Route path="ui/nine-slice" element={<UIComponentsPage />} />

          {/* Hooks */}
          <Route path="hooks/use-game" element={<UseGameHook />} />
          <Route path="hooks/use-game-loop" element={<UseGameLoopHook />} />
          <Route path="hooks/use-input" element={<InputPage />} />
          <Route path="hooks/use-collision" element={<CollisionPage />} />
          <Route path="hooks/use-timer" element={<UseGameLoopHook />} /> {/* Maybe create specific Timer page later */}
          <Route path="hooks/use-tween" element={<Animation />} />
          <Route path="hooks/use-assets" element={<UseAssetsHook />} />
          <Route path="hooks/use-audio" element={<AudioPage />} />

          {/* Effects */}
          <Route path="effects/screen-shake" element={<CameraPage />} />
          <Route path="effects/easing" element={<Animation />} />

          {/* Components - Redirects or Duplicates for Sidebar structure */}
          <Route path="components/blaze-game" element={<GettingStarted />} />
          <Route path="components/sprites" element={<Sprites />} />

          {/* Examples */}
          <Route path="examples/space-shooter" element={<SpaceShooterExample />} />
          <Route path="examples/platformer" element={<PlatformerExample />} />
          <Route path="examples/endless-runner" element={<EndlessRunnerExample />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
