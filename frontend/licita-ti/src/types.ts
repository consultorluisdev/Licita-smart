export type Status =
  | "active"
  | "paused"
  | "closed"
  | "pending";

export interface Licitation {
  id: string;
  edital: string;
  objeto: string;
  orgao: string;
  municipio: string;
  uf: string;
  modalidade: string;
  valor: number;
  dataPublicacao: string;
  prazo: string;
  status: Status;
  score: number;
  categoria: string;
}
export interface Opportunity {
  id: string;
  title: string;
  agency: string;
  location: string;
  value: number | null;
  deadline: string | null;
  category: string;
  sourceUrl?: string;
}

export interface Metric {
  label: string;
  value: string;
  change: string;
  positive?: boolean;
}