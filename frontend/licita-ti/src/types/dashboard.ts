import type { Opportunity } from "../types";

export interface DashboardMetric {
  id: "licitacoes" | "orgaos" | "estados" | "comValor" | "comPrazo" | "valorTotal";
  label: string;
  value: string;
  detail: string;
}

export interface DashboardOverview {
  metrics: DashboardMetric[];
  opportunityTrend: {
    id: string;
    label: string;
    title: string;
    value: number;
    height: number;
  }[];
  categoryDistribution: {
    category: string;
    count: number;
    percentage: number;
  }[];
  opportunities: Opportunity[];
}