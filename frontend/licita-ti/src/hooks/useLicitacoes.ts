import { useEffect, useState } from "react";
import { listarLicitacoes } from "../services/licitacaoService";
import { type BuscaResponse, type LicitacoesParams } from "../types/licitacao";

interface UseLicitacoesResult {
  dados: BuscaResponse | null;
  loading: boolean;
  error: string | null;
}

export function useLicitacoes(
  params: LicitacoesParams = {},
): UseLicitacoesResult {
  const { uf, pagina, tamanho, apenas_ti } = params;
  const [dados, setDados] = useState<BuscaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function carregar() {
      try {
        setLoading(true);
        setError(null);

        const resposta = await listarLicitacoes({
          uf,
          pagina,
          tamanho,
          apenas_ti,
        });

        if (active) {
          setDados(resposta);
        }
      } catch (err) {
        console.error("Erro ao buscar licitações:", err);

        if (active) {
          setError("Não foi possível carregar as licitações. Tente novamente.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void carregar();

    return () => {
      active = false;
    };
  }, [apenas_ti, pagina, tamanho, uf]);

  return {
    dados,
    loading,
    error,
  };
}