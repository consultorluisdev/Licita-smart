import type { LucideIcon } from "lucide-react";
import type { DashboardMetric } from "../types/dashboard";

interface MetricCardProps {
  metric: DashboardMetric;
  icon: LucideIcon;
}

export function MetricCard({ metric, icon: Icon }: MetricCardProps) {
  return (
    <article className="card min-w-0 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-slate-500">{metric.label}</p>
          <p className="mt-3 truncate text-xl font-semibold tracking-tight">
            {metric.value}
          </p>
        </div>
        <span className="rounded-lg bg-white/[.05] p-2 text-slate-400">
          <Icon size={18} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 truncate text-[11px] text-slate-500" title={metric.detail}>
        {metric.detail}
      </p>
    </article>
  );
}
