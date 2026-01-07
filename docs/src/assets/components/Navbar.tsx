import { Link } from 'react-router-dom'
import { Github, Package } from 'lucide-react'

export function Navbar() {
    return (
        <nav className="fixed top-0 w-full z-50 bg-black border-b border-neutral-900">
            <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3">
                    <img src="/logo.png" alt="Blaze" className="w-8 h-8 object-contain" />
                    <span className="font-semibold text-white">blaze-engine</span>
                </Link>

                {/* Links */}
                <div className="flex items-center gap-6">
                    <Link to="/docs" className="text-sm text-neutral-400 hover:text-white transition-colors">
                        Docs
                    </Link>
                    <a href="https://github.com/itzpratapdevs/Blaze" target="_blank" className="text-neutral-400 hover:text-white transition-colors">
                        <Github className="w-5 h-5" />
                    </a>
                    <a href="https://www.npmjs.com/package/blaze-engine" target="_blank" className="text-neutral-400 hover:text-white transition-colors">
                        <Package className="w-5 h-5" />
                    </a>
                </div>
            </div>
        </nav>
    )
}
