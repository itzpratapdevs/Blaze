import { Zap, Layers, Code2, Globe, Gamepad2, Sparkles } from 'lucide-react'

const features = [
    { icon: Globe, title: "Universal Engine", desc: "Write once. Run continuously on React Web, Next.js, iOS, and Android." },
    { icon: Code2, title: "React Hooks API", desc: "Modern declarative game logic. Use standard React state and effects." },
    { icon: Gamepad2, title: "Input System", desc: "Multi-touch for mobile. Keyboard & Mouse for web. Zero config." },
    { icon: Layers, title: "ECS", desc: "Scalable Entity-Component-System architecture for complex game logic." },
    { icon: Sparkles, title: "Skia Rendering", desc: "Powered by Skia (Chrome's rendering engine). Blazing fast 2D graphics." },
    { icon: Zap, title: "Physics & Collision", desc: "Built-in AABB collision detection and physics step management." }
]

export function Features() {
    return (
        <section className="py-12 sm:py-20 bg-black border-t border-neutral-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8">Why Blaze?</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {features.map((f, i) => (
                        <div key={i} className="flex gap-3 sm:gap-4 p-3 sm:p-0 rounded-lg sm:rounded-none bg-neutral-900/50 sm:bg-transparent">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-center shrink-0">
                                <f.icon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-semibold text-white text-sm sm:text-base mb-0.5 sm:mb-1">{f.title}</h3>
                                <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* APIs section */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-12 sm:mt-16">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8">Works Everywhere</h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    {/* Web */}
                    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 sm:p-6">
                        <div className="text-base sm:text-lg font-bold text-white mb-1.5 sm:mb-2">React.js</div>
                        <p className="text-xs sm:text-sm text-neutral-500 mb-3 sm:mb-4">Drop into any Vite/Create-React-App project.</p>
                        <div className="text-xs font-mono bg-neutral-900 p-2 rounded text-neutral-400 overflow-x-auto">
                            npm install blaze-engine
                        </div>
                    </div>

                    {/* Next.js */}
                    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 sm:p-6">
                        <div className="text-base sm:text-lg font-bold text-white mb-1.5 sm:mb-2">Next.js</div>
                        <p className="text-xs sm:text-sm text-neutral-500 mb-3 sm:mb-4">SSR compatible. Perfect for game portals.</p>
                        <div className="text-xs font-mono bg-neutral-900 p-2 rounded text-neutral-400">
                            'use client'
                        </div>
                    </div>

                    {/* Native */}
                    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 sm:p-6">
                        <div className="text-base sm:text-lg font-bold text-white mb-1.5 sm:mb-2">React Native</div>
                        <p className="text-xs sm:text-sm text-neutral-500 mb-3 sm:mb-4">Native performance on iOS and Android.</p>
                        <div className="text-xs font-mono bg-neutral-900 p-2 rounded text-neutral-400">
                            JSI + Skia Native
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
