import type { ReactNode } from "react";

interface BadgeProps {
    children: ReactNode;
    tone?:
    | "neutral"
    | "success"
    | "warning"
    | "danger"
    | "info"
}

export function Badge({
    children,
    tone = "neutral",
}: BadgeProps) {
    const tones = {
        neutral:
        "bg-white/5 text-slate-300 border-white/10",
        success:
        "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
        warning:
        "bg-amber-500/10 text-amber-300 border-amber-500/20",
        danger:
        "bg-rose-500/10 text-rose-300 border-rose-500/20",
        info:
        "bg-sky-500/10 text-sky-300 border-sky-500/20",
    };
    return(
        <span
        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${tones[tone]}`}
        >
            {children}
        </span>
    );
}