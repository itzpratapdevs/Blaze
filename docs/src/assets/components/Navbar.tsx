import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'

export function Navbar() {
    return (
        <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-neutral-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 sm:gap-3">
                    <img src="/logo.webp" alt="Blaze" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
                    <span className="font-semibold text-white text-sm sm:text-base">blaze-engine</span>
                </Link>

                {/* Links */}
                <div className="flex items-center gap-4 sm:gap-6">
                    <Link to="/docs" className="text-xs sm:text-sm text-neutral-400 hover:text-white transition-colors">
                        Docs
                    </Link>
                    <a href="https://www.npmjs.com/package/blaze-engine" target="_blank" className="text-neutral-400 hover:text-white transition-colors p-1">
                        <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                </div>
            </div>
        </nav>
    )
}
