import { Link } from 'react-router-dom'

export function Footer() {
    return (
        <footer className="bg-black border-t border-neutral-900 py-6 sm:py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-neutral-500">
                <div className="flex flex-wrap items-center justify-center gap-2">
                    <img src="/logo.webp" alt="Blaze" className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
                    <span>blaze-engine</span>
                    <span className="hidden sm:inline">•</span>
                    <span>MIT License</span>
                </div>
                <div className="flex items-center gap-4 sm:gap-6">
                    <Link to="/docs" className="hover:text-white transition-colors">Documentation</Link>
                    <a href="https://www.npmjs.com/package/blaze-engine" target="_blank" className="hover:text-white transition-colors">NPM</a>
                </div>
            </div>
        </footer>
    )
}
