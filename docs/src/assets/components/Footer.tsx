import { Link } from 'react-router-dom'

export function Footer() {
    return (
        <footer className="bg-black border-t border-neutral-900 py-8">
            <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
                <div className="flex items-center gap-2">
                    <img src="/logo.webp" alt="Blaze" className="w-6 h-6 object-contain" />
                    <span>blaze-engine</span>
                    <span>•</span>
                    <span>MIT License</span>
                </div>
                <div className="flex items-center gap-6">
                    <Link to="/docs" className="hover:text-white transition-colors">Documentation</Link>
                    <a href="https://github.com/itzpratapdevs/Blaze" target="_blank" className="hover:text-white transition-colors">GitHub</a>
                    <a href="https://www.npmjs.com/package/blaze-engine" target="_blank" className="hover:text-white transition-colors">NPM</a>
                </div>
            </div>
        </footer>
    )
}
