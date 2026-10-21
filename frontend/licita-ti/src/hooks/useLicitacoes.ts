import { useCallback, useEffect, useState } from "react";
import { listarLicitacoes } from "../services/licitacaoService";
import { type BuscaResponse, type LicitacoesParams } from "../types/licitacao";

interface UseLicitacoesResult {
  dados: BuscaResponse | null;
  loading: boolean;
  error: string | null;
  buscar: (params?: LicitacoesParams) => Promise<void>;
}

export function useLicitacoes(
  params: LicitacoesParams = {},
): UseLicitacoesResult {
  const [dados, setDados] = useState<BuscaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buscar = useCallback(
    async (novosParams?: LicitacoesParams) => {
      try {
        setLoading(true);
        setError(null);

        const resposta = await listarLicitacoes({
          ...params,
          ...novosParams,
        });

        setDados(resposta);
      } catch (err) {
        console.error("Erro ao buscar licitações:", err);

        setError("Não foi possível carregar as licitações. Tente novamente.");
      } finally {
        setLoading(false);
      }
    },
    [params],
  );

  useEffect(() => {
    void buscar();
  }, [buscar]);

  return {
    dados,
    loading,
    error,
    buscar,
  };
}