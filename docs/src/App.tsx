import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Landing } from './pages/Landing'
import { DocsLayout } from './layouts/DocsLayout'
import { GettingStarted } from './pages/docs/GettingStarted'
import { Installation } from './pages/docs/Installation'
import { QuickStart } from './pages/docs/QuickStart'
import { GameLoop } from './pages/docs/GameLoop'
import { Scenes } from './pages/docs/Scenes'
import { Entities } from './pages/docs/Entities'
import { Sprites } from './pages/docs/Sprites'
import { Animation } from './pages/docs/Animation'
import { CameraDoc } from './pages/docs/Camera'
import { UseGameHook } from './pages/docs/hooks/UseGame'
import { UseGameLoopHook } from './pages/docs/hooks/UseGameLoop'
import { UseTouchHook } from './pages/docs/hooks/UseTouch'
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
          <Route path="animation" element={<Animation />} />
          <Route path="camera" element={<CameraDoc />} />

          {/* Hooks */}
          <Route path="hooks/use-game" element={<UseGameHook />} />
          <Route path="hooks/use-game-loop" element={<UseGameLoopHook />} />
          <Route path="hooks/use-touch" element={<UseTouchHook />} />
          <Route path="hooks/use-assets" element={<UseAssetsHook />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
