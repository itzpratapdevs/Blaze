import { NavLink } from 'react-router-dom'
import { ChevronRight, Book, Box, Layers, Code2, Gamepad2, Sparkles, Layout } from 'lucide-react'

interface SidebarSection {
    title: string
    icon: React.ComponentType<{ className?: string }>
    badge?: string
    items: { label: string; href: string }[]
}

const sections: SidebarSection[] = [
    {
        title: "Getting Started",
        icon: Book,
        items: [
            { label: "Introduction", href: "/docs" },
            { label: "Installation", href: "/docs/installation" },
            { label: "Quick Start", href: "/docs/quickstart" },
        ]
    },
    {
        title: "Components",
        icon: Box,
        items: [
            { label: "BlazeGame", href: "/docs/components/blaze-game" },
            { label: "Sprites", href: "/docs/components/sprites" },
            { label: "Shapes", href: "/docs/components/shapes" },
            { label: "Text", href: "/docs/components/text" },
        ]
    },
    {
        title: "Rendering",
        icon: Layers,
        items: [
            { label: "Camera", href: "/docs/camera" },
            { label: "Parallax", href: "/docs/parallax" },
            { label: "Particles", href: "/docs/particles" },
        ]
    },
    {
        title: "World & Physics",
        icon: Gamepad2,
        badge: "NEW",
        items: [
            { label: "Tilemap", href: "/docs/tilemap" },
            { label: "Rigidbody", href: "/docs/rigidbody" },
            { label: "Collision", href: "/docs/collision" },
            { label: "Scenes", href: "/docs/scenes" },
        ]
    },
    {
        title: "UI Components",
        icon: Layout,
        badge: "NEW",
        items: [
            { label: "Joystick", href: "/docs/ui/joystick" },
            { label: "Button", href: "/docs/ui/button" },
            { label: "ProgressBar", href: "/docs/ui/progress-bar" },
            { label: "NineSlice", href: "/docs/ui/nine-slice" },
        ]
    },
    {
        title: "Hooks",
        icon: Code2,
        items: [
            { label: "useGameLoop", href: "/docs/hooks/use-game-loop" },
            { label: "useInput", href: "/docs/hooks/use-input" },
            { label: "useCollision", href: "/docs/hooks/use-collision" },
            { label: "useTimer", href: "/docs/hooks/use-timer" },
            { label: "useTween", href: "/docs/hooks/use-tween" },
            { label: "useAssets", href: "/docs/hooks/use-assets" },
            { label: "useAudio", href: "/docs/hooks/use-audio" },
        ]
    },
    {
        title: "Effects",
        icon: Sparkles,
        items: [
            { label: "Screen Shake", href: "/docs/effects/screen-shake" },
            { label: "Easing Functions", href: "/docs/effects/easing" },
        ]
    }
]

export function Sidebar() {
    return (
        <nav className="space-y-6">
            {sections.map((section, idx) => (
                <div key={idx} className="docs-sidebar-section">
                    {/* Section header */}
                    <div className="flex items-center gap-2 px-3 mb-3">
                        <section.icon className="w-4 h-4 text-neutral-600" />
                        <h4 className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                            {section.title}
                        </h4>
                        {section.badge && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-orange-500/20 text-orange-400 rounded">
                                {section.badge}
                            </span>
                        )}
                    </div>

                    {/* Section items */}
                    <ul className="space-y-0.5">
                        {section.items.map((item, i) => (
                            <li key={i}>
                                <NavLink
                                    to={item.href}
                                    end={item.href === '/docs'}
                                    className={({ isActive }) =>
                                        `docs-sidebar-link ${isActive ? 'docs-sidebar-link-active' : ''}`
                                    }
                                >
                                    <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                                    <span>{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}

            {/* Bottom resources */}
            <div className="pt-6 mt-6 border-t border-white/5">
                <div className="px-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-3">
                    Examples
                </div>
                <ul className="space-y-0.5">
                    <li>
                        <NavLink to="/docs/examples/space-shooter" className="docs-sidebar-link">
                            <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                            <span>🚀 Space Shooter</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/docs/examples/platformer" className="docs-sidebar-link">
                            <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                            <span>🎮 Platformer</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/docs/examples/endless-runner" className="docs-sidebar-link">
                            <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                            <span>🏃 Endless Runner</span>
                        </NavLink>
                    </li>
                </ul>
            </div>

            {/* Resources section removed */}
        </nav>
    )
}
