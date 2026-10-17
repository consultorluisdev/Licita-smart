import { api } from "../api";
import type { Opportunity } from "../types";
import type { DashboardOverview } from "../types/dashboard";
import { brl } from "../utils/format";

interface BackendLicitacao {
  id: string;
  objeto: string;
  orgao: string;
  uf: string | null;
  municipio: string | null;
  valor_estimado: number | null;
  modalidade: string | null;
  data_publicacao: string | null;
  data_limite: string | null;
  link_pncp: string;
}

interface BackendBuscaResponse {
  total: number;
  pagina: number;
  resultados: BackendLicitacao[];
}

function categorize(title: string) {
  const normalized = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (/ciber|seguranca|security/.test(normalized)) return "Cibersegurança";
  if (/dados|indicadores|analytics|\bbi\b/.test(normalized)) return "Dados / BI";
  if (/nuvem|cloud/.test(normalized)) return "Cloud";
  if (/desenvolvimento|software|sistema|saas|plataforma/.test(normalized)) {
    return "Software e desenvolvimento";
  }
  return "Tecnologia";
}

function mapOpportunity(item: BackendLicitacao): Opportunity {
  const location = [item.municipio, item.uf].filter(Boolean).join(" / ");

  return {
    id: item.id,
    title: item.objeto,
    agency: item.orgao,
    location: location || "Local não informado",
    value: item.valor_estimado,
    deadline: item.data_limite,
    category: categorize(item.objeto),
    sourceUrl: item.link_pncp || undefined,
  };
}

export async function getDashboard(): Promise<DashboardOverview> {
  const { data } = await api.get<BackendBuscaResponse>("/licitacoes", {
    params: { pagina: 1, tamanho: 50, apenas_ti: true },
  });
  const opportunities = data.resultados.map(mapOpportunity);
  const withValues = opportunities.filter(
    (opportunity): opportunity is Opportunity & { value: number } =>
      opportunity.value !== null && Number.isFinite(opportunity.value),
  );
  const totalValue = withValues.reduce(
    (total, opportunity) => total + opportunity.value,
    0,
  );
  const agencies = new Set(opportunities.map((opportunity) => opportunity.agency));
  const states = new Set(
    data.resultados
      .map((item) => item.uf?.trim().toUpperCase())
      .filter((uf): uf is string => Boolean(uf)),
  );
  const categories = new Map<string, number>();

  for (const opportunity of opportunities) {
    categories.set(
      opportunity.category,
      (categories.get(opportunity.category) ?? 0) + 1,
    );
  }

  const categoryDistribution = Array.from(categories, ([category, count]) => ({
    category,
    count,
    percentage: opportunities.length
      ? Math.round((count / opportunities.length) * 100)
      : 0,
  })).sort((a, b) => b.count - a.count);

  const topValues = withValues
    .slice()
    .sort((a, b) => b.value - a.value)
    .slice(0, 7);
  const highestValue = topValues[0]?.value ?? 0;

  const opportunityTrend = topValues.map((opportunity, index) => ({
    id: opportunity.id,
    label: String(index + 1),
    title: opportunity.title,
    value: opportunity.value,
    height: highestValue > 0
      ? Math.max(8, Math.round((opportunity.value / highestValue) * 100))
      : 0,
  }));

  const formatCount = (value: number) =>
    new Intl.NumberFormat("pt-BR").format(value);

  return {
    metrics: [
      {
        id: "licitacoes",
        label: "Licitações recebidas",
        value: formatCount(opportunities.length),
        detail: `Página ${data.pagina}`,
      },
      {
        id: "orgaos",
        label: "Órgãos",
        value: formatCount(agencies.size),
        detail: "Com licitações nesta página",
      },
      {
        id: "estados",
        label: "Estados",
        value: formatCount(states.size),
        detail: "UFs identificadas",
      },
      {
        id: "comValor",
        label: "Com valor estimado",
        value: formatCount(withValues.length),
        detail: "Informado pelo PNCP",
      },
      {
        id: "comPrazo",
        label: "Com prazo informado",
        value: formatCount(
          data.resultados.filter((item) => Boolean(item.data_limite)).length,
        ),
        detail: "Data limite disponível",
      },
      {
        id: "valorTotal",
        label: "Valor estimado",
        value: brl(totalValue),
        detail: "Soma dos valores nesta página",
      },
    ],
    opportunityTrend,
    categoryDistribution,
    opportunities,
  };
}