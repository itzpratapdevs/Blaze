import { Link } from 'react-router-dom'
import { Copy, Check, Github, BookOpen } from 'lucide-react'
import { useState } from 'react'

export function Hero() {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText('npm install blaze-engine')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <section className="pt-32 pb-20 bg-black">
            <div className="max-w-4xl mx-auto px-6 text-center">
                {/* Package name */}
                <div className="flex items-center justify-center gap-4 mb-6">
                    <img src="/logo.png" alt="Blaze Logo" className="w-16 h-16 object-contain" />
                    <h1 className="text-4xl md:text-5xl font-bold text-white">blaze-engine</h1>
                </div>

                {/* Description */}
                <p className="text-xl text-neutral-400 mb-8 max-w-2xl mx-auto">
                    The Universal Game Engine for
                    <span className="text-white font-semibold"> React.js</span>,
                    <span className="text-white font-semibold"> Next.js</span> &
                    <span className="text-white font-semibold"> React Native</span>.
                    <br />
                    Write once, run everywhere.
                </p>

                {/* Install command */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
                        <span className="px-4 py-3 text-neutral-500 bg-neutral-950 border-r border-neutral-800 text-sm">$</span>
                        <code className="px-4 py-3 text-neutral-200 font-mono text-sm">npm install blaze-engine</code>
                        <button
                            onClick={handleCopy}
                            className="px-4 py-3 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors border-l border-neutral-800"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Links */}
                <div className="flex items-center justify-center gap-4 mb-12">
                    <Link
                        to="/docs"
                        className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-semibold rounded-lg transition-colors"
                    >
                        <BookOpen className="w-4 h-4" />
                        Start Building
                    </Link>
                    <a
                        href="https://github.com/itzpratapdevs/Blaze"
                        target="_blank"
                        className="flex items-center gap-2 px-5 py-2.5 border border-neutral-700 text-neutral-300 hover:bg-neutral-900 rounded-lg transition-colors"
                    >
                        <Github className="w-4 h-4" />
                        GitHub
                    </a>
                </div>

                {/* Version badge */}
                <div className="inline-flex items-center gap-3 text-sm text-neutral-500">
                    <span className="px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-xs font-mono">v0.2.0</span>
                    <span>•</span>
                    <span>Web & Native</span>
                    <span>•</span>
                    <span>TypeScript</span>
                </div>
            </div>

            {/* Quick example */}
            <div className="max-w-3xl mx-auto px-6 mt-16">
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-900">
                        <span className="text-xs text-neutral-500">Works in React & React Native</span>
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-neutral-700" />
                            <div className="w-3 h-3 rounded-full bg-neutral-700" />
                            <div className="w-3 h-3 rounded-full bg-neutral-700" />
                        </div>
                    </div>
                    <pre className="p-6 text-sm overflow-x-auto">
                        <code className="text-neutral-300">{`import { BlazeCanvas, useGame, useGameLoop } from 'blaze-engine';

function Game() {
  // Works exactly the same on Web and Mobile
  const { game } = useGame({ width: 360, height: 640 });
  
  useGameLoop((dt) => {
    // 60fps loop (raf on web, JSI on native)
    player.update(dt);
  });

  return <BlazeCanvas game={game} />;
}`}</code>
                    </pre>
                </div>
            </div>
        </section>
    )
}
