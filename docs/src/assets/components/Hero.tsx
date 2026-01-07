import { Link } from 'react-router-dom'
import { Copy, Check, Github, BookOpen } from 'lucide-react'
import { useState } from 'react'
import { Highlight, themes } from 'prism-react-renderer'

export function Hero() {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText('npm install blaze-engine')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <section className="pt-20 sm:pt-32 pb-12 sm:pb-20 bg-black">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                {/* Package name */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6">
                    <img src="/logo.webp" alt="Blaze Logo" className="w-12 h-12 sm:w-16 sm:h-16 object-contain" />
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">blaze-engine</h1>
                </div>

                {/* Description */}
                <p className="text-lg sm:text-xl text-neutral-400 mb-6 sm:mb-8 max-w-2xl mx-auto">
                    The Universal Game Engine for
                    <span className="text-white font-semibold"> React.js</span>,
                    <span className="text-white font-semibold"> Next.js</span> &
                    <span className="text-white font-semibold"> React Native</span>.
                    <br className="hidden sm:block" />
                    <span className="sm:hidden"> </span>
                    Write once, run everywhere.
                </p>

                {/* Install command */}
                <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8">
                    <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden max-w-full">
                        <span className="px-3 sm:px-4 py-2.5 sm:py-3 text-neutral-500 bg-neutral-950 border-r border-neutral-800 text-xs sm:text-sm">$</span>
                        <code className="px-3 sm:px-4 py-2.5 sm:py-3 text-neutral-200 font-mono text-xs sm:text-sm truncate">npm install blaze-engine</code>
                        <button
                            onClick={handleCopy}
                            className="px-3 sm:px-4 py-2.5 sm:py-3 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors border-l border-neutral-800 shrink-0"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Links */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12">
                    <Link
                        to="/docs"
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-semibold rounded-lg transition-colors"
                    >
                        <BookOpen className="w-4 h-4" />
                        Start Building
                    </Link>
                    <a
                        href="https://github.com/itzpratapdevs/Blaze"
                        target="_blank"
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 border border-neutral-700 text-neutral-300 hover:bg-neutral-900 rounded-lg transition-colors"
                    >
                        <Github className="w-4 h-4" />
                        GitHub
                    </a>
                </div>

                {/* Version badge */}
                <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-neutral-500">
                    <span className="px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-xs font-mono">v0.2.0</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Web & Native</span>
                    <span className="hidden sm:inline">•</span>
                    <span>TypeScript</span>
                </div>
            </div>

            {/* Quick example */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-10 sm:mt-16">
                <div className="bg-[#0d1117] border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
                    {/* Mac-style window header */}
                    <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-neutral-800 bg-neutral-900/80">
                        {/* Mac-style traffic light buttons */}
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-110 transition-all shadow-inner" title="Close" />
                            <div className="w-3 h-3 rounded-full bg-[#febc2e] hover:brightness-110 transition-all shadow-inner" title="Minimize" />
                            <div className="w-3 h-3 rounded-full bg-[#28c840] hover:brightness-110 transition-all shadow-inner" title="Maximize" />
                        </div>
                        <span className="text-[10px] sm:text-xs text-neutral-500 font-medium">Game.tsx</span>
                        <div className="w-16" /> {/* Spacer for balance */}
                    </div>

                    {/* Syntax highlighted code */}
                    <Highlight
                        theme={themes.nightOwl}
                        code={`import { BlazeCanvas, useGame, useGameLoop } from 'blaze-engine';

function Game() {
  // Works exactly the same on Web and Mobile
  const { game } = useGame({ width: 360, height: 640 });
  
  useGameLoop((dt) => {
    // 60fps loop (raf on web, JSI on native)
    player.update(dt);
  });

  return <BlazeCanvas game={game} />;
}`}
                        language="tsx"
                    >
                        {({ style, tokens, getLineProps, getTokenProps }) => (
                            <pre
                                className="p-4 sm:p-6 text-xs sm:text-sm overflow-x-auto"
                                style={{ ...style, background: 'transparent', margin: 0 }}
                            >
                                {tokens.map((line, i) => (
                                    <div key={i} {...getLineProps({ line })}>
                                        <span className="text-neutral-600 select-none mr-4 text-xs inline-block w-4 text-right">
                                            {i + 1}
                                        </span>
                                        {line.map((token, key) => (
                                            <span key={key} {...getTokenProps({ token })} />
                                        ))}
                                    </div>
                                ))}
                            </pre>
                        )}
                    </Highlight>
                </div>
            </div>
        </section>
    )
}
