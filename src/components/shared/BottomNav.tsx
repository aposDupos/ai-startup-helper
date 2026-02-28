"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    MessageCircle,
    Wrench,
    BookOpen,
    User,
} from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/mentor", label: "Chat", icon: MessageCircle },
    { href: "/workspace", label: "Work", icon: Wrench },
    { href: "/academy", label: "Academy", icon: BookOpen },
    { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav
            className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-0 border-t border-surface-200 z-30"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center gap-1 px-3 py-1"
                        >
                            <div className="relative">
                                <Icon
                                    size={22}
                                    strokeWidth={1.75}
                                    style={{
                                        color: isActive
                                            ? "var(--color-primary-500)"
                                            : "var(--color-surface-400)",
                                    }}
                                />
                                {isActive && (
                                    <div
                                        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                                        style={{ backgroundColor: "var(--color-primary-500)" }}
                                    />
                                )}
                            </div>
                            <span
                                className="text-[10px] font-medium"
                                style={{
                                    color: isActive
                                        ? "var(--color-primary-500)"
                                        : "var(--color-surface-400)",
                                }}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
