import { useEffect, useState } from "react";
import {
  BarChart3,
  Building2,
  CalendarDays,
  FileText,
  MapPin,
  WalletCards,
} from "lucide-react";

import { Badge } from "../components/Badge";
import { LicitationTable } from "../components/LicitationTable";
import { MetricCard } from "../components/MetricCard";
import { PageHeader } from "../components/PageHeader";
import { getDashboard } from "../services/dashboardService";
import type { DashboardMetric, DashboardOverview } from "../types/dashboard";
import { brl } from "../utils/format";

const metricIcons = {
  licitacoes: FileText,
  orgaos: Building2,
  estados: MapPin,
  comValor: WalletCards,
  comPrazo: CalendarDays,
  valorTotal: BarChart3,
} satisfies Record<DashboardMetric["id"], typeof FileText>;

export function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);
      setError(null);

      try {
        const data = await getDashboard();
        if (active) setDashboard(data);
      } catch (err) {
        console.error("Falha ao carregar a dashboard:", err);
        if (active) {
          setError(
            err instanceof Error
              ? `Não foi possível carregar as licitações: ${err.message}`
              : "Não foi possível carregar as licitações. Verifique se a API está em execução.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadDashboard();
    return () => {
      active = false;
    };
  }, [retry]);

  if (loading) return <DashboardSkeleton />;

  if (error || !dashboard) {
    return (
      <div className="mx-auto max-w-[1600px]">
        <PageHeader
          title="Procurement Intelligence"
          subtitle="Monitore oportunidades públicas alinhadas ao perfil da sua empresa."
        />
        <div className="card flex min-h-[300px] items-center justify-center p-8">
          <div className="max-w-xl text-center">
            <p className="text-sm text-rose-300">
              {error ?? "A API não retornou dados para a dashboard."}
            </p>
            <button
              onClick={() => setRetry((value) => value + 1)}
              className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-slate-200"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Procurement Intelligence"
        subtitle="Acompanhe licitações retornadas pela API do PNCP e identifique oportunidades para sua empresa."
        action={
          <Badge tone="success">
            {dashboard.opportunities.length} resultados na página
          </Badge>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {dashboard.metrics.map((metric) => {
          const Icon = metricIcons[metric.id];
          return <MetricCard key={metric.id} metric={metric} icon={Icon} />;
        })}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <section className="card p-5">
          <div>
            <h2 className="font-semibold">Maiores valores estimados</h2>
            <p className="mt-1 text-xs text-slate-500">
              Licitações desta página com valor informado pela API
            </p>
          </div>

          {dashboard.opportunityTrend.length > 0 ? (
            <div className="mt-6 grid h-56 grid-cols-7 items-end gap-3">
              {dashboard.opportunityTrend.map((item) => (
                <div
                  key={item.id}
                  className="flex h-full min-w-0 flex-col justify-end gap-2"
                >
                  <div
                    aria-label={`${item.title}: ${brl(item.value)}`}
                    title={`${item.title}: ${brl(item.value)}`}
                    className="rounded-t-lg bg-white/[.08] transition hover:bg-white/[.15]"
                    style={{ height: `${item.height}%` }}
                  />
                  <span className="text-center text-[10px] text-slate-600">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-8 text-sm text-slate-500">
              A API não retornou valores estimados para estes resultados.
            </p>
          )}
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Categorias encontradas</h2>
              <p className="mt-1 text-xs text-slate-500">
                Classificação baseada no objeto da licitação
              </p>
            </div>
            <BarChart3 size={18} className="text-slate-500" />
          </div>

          {dashboard.categoryDistribution.length > 0 ? (
            <div className="mt-6 space-y-4">
              {dashboard.categoryDistribution.map((item) => (
                <div key={item.category}>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-slate-300">{item.category}</span>
                    <span className="text-slate-500">{item.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-slate-300 transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-8 text-sm text-slate-500">
              Nenhuma categoria disponível.
            </p>
          )}
        </section>
      </div>

      <section className="card mt-5 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#242833] p-5">
          <div>
            <h2 className="font-semibold">Licitações encontradas</h2>
            <p className="mt-1 text-xs text-slate-500">
              Resultados atuais da API, com acesso ao edital no PNCP quando disponível
            </p>
          </div>
          <Badge tone="info">{dashboard.opportunities.length} resultados</Badge>
        </div>
        <LicitationTable opportunities={dashboard.opportunities} compact />
      </section>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-[1600px] animate-pulse">
      <div className="mb-7">
        <div className="h-8 w-72 rounded-lg bg-white/5" />
        <div className="mt-3 h-4 w-[480px] max-w-full rounded bg-white/5" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="card h-36 bg-white/[.02]" />
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <div className="card h-72" />
        <div className="card h-72" />
      </div>
      <div className="card mt-5 h-80" />
    </div>
  );
}
