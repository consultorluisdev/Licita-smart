export interface Licitacao {
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
  cnpj_orgao: string | null;
}

export interface BuscaResponse {
  total: number;
  pagina: number;
  tamanho: number;
  tem_proxima_pagina: boolean;
  resultados: Licitacao[];
}

export interface LicitacoesParams {
  uf?: string;
  pagina?: number;
  tamanho?: number;
  apenas_ti?: boolean;
}