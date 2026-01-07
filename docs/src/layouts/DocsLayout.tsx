import { Outlet, Link } from 'react-router-dom'
import { Github, Package, Search, Menu, X, Command } from 'lucide-react'
import { Sidebar } from '../assets/components/Sidebar'
import { useState } from 'react'

export function DocsLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen bg-black">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 h-16 bg-black/80 backdrop-blur-2xl border-b border-white/5">
                <div className="h-full max-w-[1600px] mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button className="lg:hidden text-neutral-400" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>

                        <Link to="/" className="flex items-center gap-3">
                            <img src="/logo.png" alt="Blaze" className="w-8 h-8 object-contain" />
                            <div className="flex flex-col leading-none">
                                <span className="font-bold text-white text-lg">Blaze</span>
                                <span className="text-[10px] text-neutral-500 font-mono tracking-wider">ENGINE</span>
                            </div>
                        </Link>

                        {/* Search */}
                        <button className="hidden md:flex items-center gap-3 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-neutral-500 text-sm hover:border-orange-500/30 transition-colors w-72">
                            <Search className="w-4 h-4" />
                            <span>Search documentation...</span>
                            <div className="ml-auto flex items-center gap-1 text-xs">
                                <Command className="w-3 h-3" />
                                <span>K</span>
                            </div>
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <a href="https://www.npmjs.com/package/blaze-engine" target="_blank" className="p-2 text-neutral-400 hover:text-orange-500 transition-colors">
                            <Package className="w-5 h-5" />
                        </a>
                        <a href="https://github.com/itzpratapdevs/Blaze" target="_blank" className="p-2 text-neutral-400 hover:text-orange-500 transition-colors">
                            <Github className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </header>

            <div className="flex pt-16">
                {/* Sidebar */}
                <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-black/95 backdrop-blur-2xl border-r border-white/5 transform transition-transform lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} pt-16 lg:pt-0`}>
                    <div className="h-full overflow-y-auto p-6">
                        <Sidebar />
                    </div>
                </aside>

                {sidebarOpen && <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

                {/* Content */}
                <main className="flex-1 min-h-[calc(100vh-4rem)]">
                    <div className="max-w-4xl mx-auto px-6 lg:px-12 py-12">
                        <article className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-neutral-400 prose-a:text-orange-400 prose-strong:text-white prose-code:text-amber-400">
                            <Outlet />
                        </article>
                    </div>
                </main>
            </div>
        </div>
    )
}
