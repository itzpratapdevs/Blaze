import { CodeBlock } from '../../components/CodeBlock'

export function Installation() {
    return (
        <>
            <h1>Installation</h1>
            <p>Blaze can be installed in React web projects (Vite, Next.js) and React Native projects.</p>

            <h2>1. Install Package</h2>
            <CodeBlock language="bash" code={`npm install blaze-engine @shopify/react-native-skia`} />

            <hr className="border-neutral-800 my-8" />

            <h2>Web Setup (React / Next.js)</h2>

            <h3>Vite</h3>
            <p>Update <code>vite.config.ts</code> to load assets:</p>
            <CodeBlock code={`// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.mp3']
})`} />

            <h3>Next.js</h3>
            <p>Since Blaze uses browser APIs, use client components:</p>
            <CodeBlock code={`'use client'

import { BlazeCanvas } from 'blaze-engine';
// ... rest of your game code`} />

            <hr className="border-neutral-800 my-8" />

            <h2>Native Setup (React Native)</h2>

            <h3>Expo (Recommended)</h3>
            <CodeBlock language="bash" code={`npx expo install @shopify/react-native-skia
npx expo prebuild`} />

            <h3>Bare React Native</h3>
            <CodeBlock language="bash" code={`cd ios && pod install`} />

            <h2>Usage</h2>
            <p>Now import it anywhere:</p>
            <CodeBlock code={`import { useGame } from 'blaze-engine';`} />
        </>
    )
}
