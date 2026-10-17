import type { ReactNode } from "react";

interface PageHeaderProps {
    title: string;
    subtitle?: string,
    action?: ReactNode
}

export function PageHeader({
    title,
    subtitle,
    action,
}: PageHeaderProps){
    return(
        <div className="mb-7 flex-col gap-4 md:flex md:items-end md:justify-between">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                    {title}
                </h1>
            {subtitle && (
                <p className="mt-2 max-w-2xl text-sm text-slate-400">
                    {subtitle}
                </p>
            )}
        </div>
        {action}
    </div>
    );
}