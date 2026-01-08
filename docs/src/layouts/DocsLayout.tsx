import { Outlet, Link } from 'react-router-dom'
import { Github, Package, Search, Menu, X, Command, BookOpen, ChevronRight } from 'lucide-react'
import { Sidebar } from '../assets/components/Sidebar'
import { useState } from 'react'

export function DocsLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="h-screen flex flex-col bg-[#0a0a0a] overflow-hidden docs-page">
            {/* Header - Fixed Height */}
            <header className="flex-none h-14 sm:h-16 w-full z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5">
                <div className="h-full max-w-[1600px] mx-auto px-3 sm:px-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-6">
                        <button
                            className="lg:hidden p-2 -ml-2 text-neutral-400 hover:text-white transition-colors"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
                        >
                            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>

                        <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
                            <img src="/logo.webp" alt="Blaze" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
                            <div className="flex flex-col leading-none">
                                <span className="font-bold text-white text-base sm:text-lg group-hover:text-orange-400 transition-colors">Blaze</span>
                                <span className="text-[8px] sm:text-[10px] text-neutral-500 font-mono tracking-wider">DOCS</span>
                            </div>
                        </Link>

                        {/* Breadcrumb */}
                        <div className="hidden md:flex items-center gap-2 text-sm text-neutral-500 ml-4">
                            <BookOpen className="w-4 h-4" />
                            <span>Documentation</span>
                        </div>

                        {/* Search */}
                        <button className="hidden md:flex items-center gap-3 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-neutral-500 text-sm hover:border-orange-500/30 hover:bg-white/[0.07] transition-all w-72 ml-4">
                            <Search className="w-4 h-4" />
                            <span>Search docs...</span>
                            <div className="ml-auto flex items-center gap-1 text-xs px-1.5 py-0.5 bg-white/5 rounded">
                                <Command className="w-3 h-3" />
                                <span>K</span>
                            </div>
                        </button>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                        {/* Version Badge */}
                        <span className="hidden sm:inline-flex px-2.5 py-1 text-xs font-mono bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-lg">
                            v0.2.0
                        </span>
                        <a href="https://www.npmjs.com/package/blaze-engine" target="_blank" className="p-2 text-neutral-400 hover:text-orange-400 transition-colors rounded-lg hover:bg-white/5">
                            <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                        </a>
                        <a href="https://github.com/itzpratapdevs/Blaze" target="_blank" className="p-2 text-neutral-400 hover:text-orange-400 transition-colors rounded-lg hover:bg-white/5">
                            <Github className="w-4 h-4 sm:w-5 sm:h-5" />
                        </a>
                    </div>
                </div>
            </header>

            {/* Main Layout Area */}
            <div className="flex-1 flex overflow-hidden max-w-[1600px] mx-auto w-full">

                {/* Desktop Sidebar - Fixed Width, Scrollable */}
                <aside className="hidden lg:block w-72 flex-none border-r border-white/5 overflow-y-auto custom-scrollbar bg-[#080808]">
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
                    <div className={`absolute inset-y-0 left-0 w-72 bg-[#0a0a0a] border-r border-white/10 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                        <div className="h-full overflow-y-auto p-6">
                            <Sidebar />
                        </div>
                    </div>
                </div>

                {/* Main Content Areas - Scrollable */}
                <main className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth bg-[#0a0a0a]">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12 pb-20 sm:pb-24">
                        {/* Content wrapper with docs-prose styling */}
                        <article className="docs-prose">
                            <Outlet />
                        </article>

                        {/* Footer navigation */}
                        <div className="mt-16 pt-8 border-t border-white/5">
                            <div className="flex items-center justify-between text-sm">
                                <div className="text-neutral-500">
                                    Was this page helpful?
                                </div>
                                <a
                                    href="https://github.com/itzpratapdevs/Blaze/issues"
                                    target="_blank"
                                    className="flex items-center gap-1 text-neutral-400 hover:text-orange-400 transition-colors"
                                >
                                    <span>Report an issue</span>
                                    <ChevronRight className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
