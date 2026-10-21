import { api } from "../api";
import { type BuscaResponse, type LicitacoesParams } from "../types/licitacao";

export async function listarLicitacoes(
  params: LicitacoesParams = {},
): Promise<BuscaResponse> {
  const { data } = await api.get<BuscaResponse>("/licitacoes", {
    params: {
      uf: params.uf,
      pagina: params.pagina ?? 1,
      tamanho: params.tamanho ?? 20,
      apenas_ti: params.apenas_ti ?? true,
    },
  });

  return data;
}