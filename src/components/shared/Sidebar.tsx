"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    MessageCircle,
    Wrench,
    BookOpen,
    Trophy,
    Award,
} from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/chat", label: "AI-наставник", icon: MessageCircle },
    { href: "/workspace", label: "Workspace", icon: Wrench },
    { href: "/learning", label: "Learning", icon: BookOpen },
    { href: "/gamification", label: "Достижения", icon: Award },
    { href: "/leaderboard", label: "Лидерборд", icon: Trophy },
];

export interface UserProfile {
    displayName: string;
    level: number;
    xp: number;
    streakCount: number;
}

interface SidebarProps {
    userProfile: UserProfile;
}

export function Sidebar({ userProfile }: SidebarProps) {
    const pathname = usePathname();

    const avatarInitial = userProfile.displayName.charAt(0).toUpperCase();

    return (
        <aside className="hidden md:flex flex-col w-[240px] h-screen fixed left-0 top-0 bg-surface-0 border-r border-surface-200 z-30">
            {/* Logo */}
            <div className="flex items-center gap-2 px-5 h-16 border-b border-surface-100">
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                    style={{
                        background:
                            "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
                    }}
                >
                    🚀
                </div>
                <span className="text-h4 text-surface-900">
                    Startup<span className="text-primary-500">Copilot</span>
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-sm font-medium transition-all"
                            style={{
                                backgroundColor: isActive
                                    ? "var(--color-primary-50)"
                                    : "transparent",
                                color: isActive
                                    ? "var(--color-primary-600)"
                                    : "var(--color-text-secondary)",
                                borderLeft: isActive
                                    ? "3px solid var(--color-primary-500)"
                                    : "3px solid transparent",
                            }}
                        >
                            <Icon size={20} strokeWidth={1.75} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom section: user info */}
            <div className="px-3 pb-4 border-t border-surface-100 pt-4">
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-caption font-bold text-primary-600">
                        {avatarInitial}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-body-sm font-medium text-surface-900 truncate">
                            {userProfile.displayName}
                        </p>
                        <p className="text-caption text-surface-400">
                            {userProfile.streakCount > 0 && (
                                <span>🔥 {userProfile.streakCount} | </span>
                            )}
                            ⭐ Lvl {userProfile.level}
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
