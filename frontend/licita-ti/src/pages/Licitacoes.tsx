import { useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  Search,
} from "lucide-react";
import { useLicitacoes } from "../hooks/useLicitacoes";

function formatarValor(valor: number | null) {
  if (valor === null) {
    return "Não informado";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function formatarData(data: string | null) {
  if (!data) {
    return "Não informado";
  }

  const dataFormatada = new Date(data);

  if (Number.isNaN(dataFormatada.getTime())) {
    return data;
  }

  return new Intl.DateTimeFormat("pt-BR").format(dataFormatada);
}

export function Licitacoes() {
  const [uf, setUf] = useState("SC");
  const [pagina, setPagina] = useState(1);
  const [termo, setTermo] = useState("");

  const { dados, loading, error } = useLicitacoes({
    uf,
    pagina,
    tamanho: 20,
    apenas_ti: true,
  });

  const resultados = dados?.resultados ?? [];

  const resultadosFiltrados = termo.trim()
    ? resultados.filter((licitacao) =>
        `${licitacao.objeto} ${licitacao.orgao}`
          .toLowerCase()
          .includes(termo.toLowerCase()),
      )
    : resultados;

  function alterarPagina(novaPagina: number) {
    if (
      novaPagina < 1 ||
      !dados ||
      (novaPagina > pagina && !dados.tem_proxima_pagina)
    ) {
      return;
    }

    setPagina(novaPagina);
  }

  function alterarUf(novaUf: string) {
    setUf(novaUf);
    setPagina(1);
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-400">
              Inteligência de Licitações
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
              Licitações
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Encontre oportunidades de tecnologias, SaaS e serviços digitais públicas
              no PNCP.
            </p>
          </div>

          {dados && (
            <div className="text-sm text-zinc-400">
              <span className="font-medium text-white">
                {dados.total.toLocaleString("pt-BR")}
              </span>{" "}
              resultados nesta página
            </div>
          )}
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />

            <input
              type="text"
              value={termo}
              onChange={(event) => setTermo(event.target.value)}
              placeholder="Pesquisar objeto ou órgão..."
              className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
            />
          </div>

          <select
            value={uf}
            onChange={(event) => alterarUf(event.target.value)}
            className="h-11 rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-sm text-white outline-none focus:border-zinc-600"
          >
            <option value="SC">Santa Catarina</option>
            <option value="PR">Paraná</option>
            <option value="RS">Rio Grande do Sul</option>
            <option value="SP">São Paulo</option>
            <option value="RJ">Rio de Janeiro</option>
            <option value="">Todos os estados</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="card flex items-center justify-center gap-3 p-8">
          <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
          <span className="text-sm text-zinc-300">Carregando licitações...</span>
        </div>
      )}

      {!loading && error && (
        <div className="card flex items-center gap-3 p-5 text-rose-300">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && (
        <>
          {resultadosFiltrados.length === 0 ? (
            <div className="card p-8 text-center text-sm text-zinc-400">
              Nenhuma licitação encontrada para os filtros atuais.
            </div>
          ) : (
            <div className="grid gap-4">
              {resultadosFiltrados.map((licitacao) => (
                <article key={licitacao.id} className="card p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-zinc-400">
                        {licitacao.orgao} • {licitacao.uf ?? "UF não informada"}
                      </p>
                      <h2 className="text-lg font-semibold text-white">
                        {licitacao.objeto}
                      </h2>
                    </div>

                    <a
                      href={licitacao.link_pncp}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 transition hover:border-zinc-500"
                    >
                      <ExternalLink size={14} />
                      Ver edital
                    </a>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.08em] text-zinc-500">
                        Valor estimado
                      </p>
                      <p className="mt-1 text-sm text-white">
                        {formatarValor(licitacao.valor_estimado)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-[0.08em] text-zinc-500">
                        Publicação
                      </p>
                      <p className="mt-1 text-sm text-white">
                        {formatarData(licitacao.data_publicacao)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-[0.08em] text-zinc-500">
                        Modalidade
                      </p>
                      <p className="mt-1 text-sm text-white">
                        {licitacao.modalidade ?? "Não informado"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-[0.08em] text-zinc-500">
                        Município
                      </p>
                      <p className="mt-1 text-sm text-white">
                        {licitacao.municipio ?? "Não informado"}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {dados && (pagina > 1 || dados.tem_proxima_pagina) && (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-300">
              <button
                type="button"
                onClick={() => alterarPagina(pagina - 1)}
                disabled={pagina === 1 || loading}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 transition hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft size={16} />
                Anterior
              </button>

              <span>
                Página {pagina}
              </span>

              <button
                type="button"
                onClick={() => alterarPagina(pagina + 1)}
                disabled={!dados.tem_proxima_pagina || loading}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 transition hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Próxima
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}