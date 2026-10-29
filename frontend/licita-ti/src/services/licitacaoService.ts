import { api } from "../api";
import { type BuscaResponse, type LicitacoesParams } from "../types/licitacao";

interface BackendLicitacao {
  id: string;
  objeto: string;
  uf: string | null;
  municipio: string | null;
  modalidade: string | null;
  valorEstimado: number | null;
  dataPublicacao: string | null;
  dataLimite: string | null;
  linkPncp: string;
  orgao: {
    razaoSocial: string;
  };
}

interface BackendBuscaResponse {
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  resultados: BackendLicitacao[];
}

export async function listarLicitacoes(
  params: LicitacoesParams = {},
): Promise<BuscaResponse> {
  const { data } = await api.get<BackendBuscaResponse>("/licitacoes", {
    params: {
      uf: params.uf,
      page: params.pagina ?? 1,
      pageSize: params.tamanho ?? 20,
    },
  });

  return {
    total: data.total,
    pagina: data.page,
    tamanho: data.pageSize,
    tem_proxima_pagina: data.hasNextPage,
    resultados: data.resultados.map((item) => ({
      id: item.id,
      objeto: item.objeto,
      orgao: item.orgao.razaoSocial,
      uf: item.uf,
      municipio: item.municipio,
      valor_estimado: item.valorEstimado,
      modalidade: item.modalidade,
      data_publicacao: item.dataPublicacao,
      data_limite: item.dataLimite,
      link_pncp: item.linkPncp,
      cnpj_orgao: null,
    })),
  };
}