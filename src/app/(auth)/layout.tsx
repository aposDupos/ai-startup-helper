import { Rocket } from "lucide-react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 px-4">
            {/* Decorative gradient background */}
            <div
                className="fixed inset-0 -z-10"
                style={{
                    background:
                        "radial-gradient(ellipse at top, var(--color-primary-50) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(249,115,22,0.05) 0%, transparent 40%)",
                }}
            />

            {/* Logo */}
            <div className="flex items-center gap-2 mb-8 animate-fade-in">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                    style={{
                        background:
                            "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
                    }}
                >
                    <Rocket size={20} strokeWidth={1.75} />
                </div>
                <span className="text-h3 text-surface-900">
                    Startup<span className="text-primary-500">Copilot</span>
                </span>
            </div>

            {/* Auth card */}
            <div className="w-full max-w-[400px] animate-fade-in">{children}</div>

            {/* Footer */}
            <p className="mt-8 text-body-sm text-surface-400">
                © 2026 StartupCopilot. Платформа Сбера.
            </p>
        </div>
    );
}
