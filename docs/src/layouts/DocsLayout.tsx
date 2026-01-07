import { Outlet, Link } from 'react-router-dom'
import { Github, Package, Search, Menu, X, Command } from 'lucide-react'
import { Sidebar } from '../assets/components/Sidebar'
import { useState } from 'react'

export function DocsLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="h-screen flex flex-col bg-black overflow-hidden">
            {/* Header - Fixed Height */}
            <header className="flex-none h-14 sm:h-16 w-full z-50 bg-black/80 backdrop-blur-2xl border-b border-white/5">
                <div className="h-full max-w-[1600px] mx-auto px-3 sm:px-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-6">
                        <button
                            className="lg:hidden p-2 -ml-2 text-neutral-400 hover:text-white transition-colors"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
                        >
                            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>

                        <Link to="/" className="flex items-center gap-2 sm:gap-3">
                            <img src="/logo.webp" alt="Blaze" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
                            <div className="flex flex-col leading-none">
                                <span className="font-bold text-white text-base sm:text-lg">Blaze</span>
                                <span className="text-[8px] sm:text-[10px] text-neutral-500 font-mono tracking-wider">ENGINE</span>
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

                    <div className="flex items-center gap-1 sm:gap-2">
                        <a href="https://www.npmjs.com/package/blaze-engine" target="_blank" className="p-2 text-neutral-400 hover:text-orange-500 transition-colors">
                            <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                        </a>
                        <a href="https://github.com/itzpratapdevs/Blaze" target="_blank" className="p-2 text-neutral-400 hover:text-orange-500 transition-colors">
                            <Github className="w-4 h-4 sm:w-5 sm:h-5" />
                        </a>
                    </div>
                </div>
            </header>

            {/* Main Layout Area */}
            <div className="flex-1 flex overflow-hidden max-w-[1600px] mx-auto w-full">

                {/* Desktop Sidebar - Fixed Width, Scrollable */}
                <aside className="hidden lg:block w-72 flex-none border-r border-white/5 overflow-y-auto custom-scrollbar">
                    <div className="p-6 pb-20">
                        <Sidebar />
                    </div>
                </aside>

                {/* Mobile Sidebar - Overlay */}
                <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
                    {/* Backdrop */}
                    <div
                        className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
                        onClick={() => setSidebarOpen(false)}
                    />

                    {/* Drawer */}
                    <div className={`absolute inset-y-0 left-0 w-72 bg-neutral-900 border-r border-white/10 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                        <div className="h-full overflow-y-auto p-6">
                            <Sidebar />
                        </div>
                    </div>
                </div>

                {/* Main Content Areas - Scrollable */}
                <main className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12 pb-20 sm:pb-24">
                        <article className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-neutral-400 prose-a:text-orange-400 prose-strong:text-white prose-code:text-amber-400 prose-pre:my-4 prose-pre:overflow-x-auto prose-img:rounded-lg">
                            <Outlet />
                        </article>
                    </div>
                </main>
            </div>
        </div>
    )
}
