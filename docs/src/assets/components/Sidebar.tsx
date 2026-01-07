import { NavLink } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

interface SidebarSection {
    title: string
    badge?: string
    items: { label: string; href: string }[]
}

const sections: SidebarSection[] = [
    {
        title: "Getting Started",
        items: [
            { label: "Introduction", href: "/docs" },
            { label: "Installation", href: "/docs/installation" },
            { label: "Quick Start", href: "/docs/quickstart" },
        ]
    },
    {
        title: "Core Concepts",
        items: [
            { label: "Game Loop", href: "/docs/game-loop" },
            { label: "Scenes", href: "/docs/scenes" },
            { label: "Entities", href: "/docs/entities" },
        ]
    },
    {
        title: "Rendering",
        items: [
            { label: "Sprites", href: "/docs/sprites" },
            { label: "Animation", href: "/docs/animation" },
            { label: "Camera", href: "/docs/camera" },
        ]
    },
    {
        title: "Hooks API",
        badge: "NEW",
        items: [
            { label: "useGame", href: "/docs/hooks/use-game" },
            { label: "useGameLoop", href: "/docs/hooks/use-game-loop" },
            { label: "useTouch", href: "/docs/hooks/use-touch" },
            { label: "useAssets", href: "/docs/hooks/use-assets" },
        ]
    }
]

export function Sidebar() {
    return (
        <nav className="space-y-5 sm:space-y-6">
            {sections.map((section, idx) => (
                <div key={idx}>
                    <h4 className="text-[10px] sm:text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 sm:mb-3 flex items-center gap-2">
                        {section.title}
                        {section.badge && (
                            <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-400 text-[9px] sm:text-[10px] font-bold rounded">
                                {section.badge}
                            </span>
                        )}
                    </h4>
                    <ul className="space-y-0.5 sm:space-y-1">
                        {section.items.map((item, i) => (
                            <li key={i}>
                                <NavLink
                                    to={item.href}
                                    end={item.href === '/docs'}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 px-3 py-2.5 sm:py-2 rounded-lg text-sm transition-all ${isActive
                                            ? 'bg-orange-500/10 text-orange-400 font-medium'
                                            : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                                        }`
                                    }
                                >
                                    <ChevronRight className="w-3 h-3 opacity-50 shrink-0" />
                                    <span className="truncate">{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </nav>
    )
}
