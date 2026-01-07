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
        <section className="py-20 bg-black border-t border-neutral-900">
            <div className="max-w-4xl mx-auto px-6">
                <h2 className="text-2xl font-bold text-white mb-8">Why Blaze?</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {features.map((f, i) => (
                        <div key={i} className="flex gap-4">
                            <div className="w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-center shrink-0">
                                <f.icon className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white mb-1">{f.title}</h3>
                                <p className="text-sm text-neutral-500">{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* APIs section */}
            <div className="max-w-4xl mx-auto px-6 mt-16">
                <h2 className="text-2xl font-bold text-white mb-8">Works Everywhere</h2>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Web */}
                    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6">
                        <div className="text-lg font-bold text-white mb-2">React.js</div>
                        <p className="text-sm text-neutral-500 mb-4">Drop into any Vite/Create-React-App project.</p>
                        <div className="text-xs font-mono bg-neutral-900 p-2 rounded text-neutral-400">
                            npm install blaze-engine
                        </div>
                    </div>

                    {/* Next.js */}
                    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6">
                        <div className="text-lg font-bold text-white mb-2">Next.js</div>
                        <p className="text-sm text-neutral-500 mb-4">SSR compatible. Perfect for game portals.</p>
                        <div className="text-xs font-mono bg-neutral-900 p-2 rounded text-neutral-400">
                            'use client'
                        </div>
                    </div>

                    {/* Native */}
                    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6">
                        <div className="text-lg font-bold text-white mb-2">React Native</div>
                        <p className="text-sm text-neutral-500 mb-4">Native performance on iOS and Android.</p>
                        <div className="text-xs font-mono bg-neutral-900 p-2 rounded text-neutral-400">
                            JSI + Skia Native
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
