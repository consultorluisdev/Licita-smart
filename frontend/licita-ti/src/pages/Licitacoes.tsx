import { Bell, Bot, ExternalLink, Eye, Star } from 'lucide-react';
import { useLicitacoes } from "../hooks/useLicitacoes";
import type { Licitacao } from "../types/licitacao";

interface LicitationTableProps {
  licitacoes: Licitacao[];
}

function formatarValor(valor: number | null | undefined) {
  if (valor == null) {
    return "Não informado";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(valor);
}

function formatarData(data: string | null | undefined) {
  if (!data) {
    return "Não informado";
  }

  const dataFormatada = new Date(data);

  if (Number.isNaN(dataFormatada.getTime())) {
    return "Não informado";
  }

  return new Intl.DateTimeFormat("pt-BR").format(dataFormatada);
}

function getOpportunityScore(licitacao: Licitacao) {
  /*
  temporario:
  score real será calculado pelo backend/servico de analise.
  enquanto isso mantemos UI preparada.
  */
  if (licitacao.valor_estimado != null && licitacao.valor_estimado >= 100000) {
    return 90;
  }

  if (licitacao.valor_estimado != null && licitacao.valor_estimado >= 50000) {
    return 78;
  }

  return 64;
}

function scoreLabel(score: number) {
  if (score >= 85) {
    return "Excelente";
  }

  if (score >= 70) {
    return "Boa";
  }

  return "Moderada";
}

function scoreClasses(score: number) {
  if (score >= 85) {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
  }

  if (score >= 70) {
    return "border-amber-500/20 bg-amber-500/10 text-amber-300";
  }

  return "border-zinc-700 bg-zinc-800/60 text-zinc-300";
}

export function Licitacoes() {
  const { dados, loading, error } = useLicitacoes({ apenas_ti: true });

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-400">
        Carregando licitações...
      </div>
    );
  }

  if (error || !dados) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-rose-300">
        {error ?? "Não foi possível carregar as licitações."}
      </div>
    );
  }

  return <LicitationTable licitacoes={dados.resultados} />;
}

export function LicitationTable({ licitacoes }: LicitationTableProps) {
  if (licitacoes.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-center text-sm text-zinc-400">
        Nenhuma licitação encontrada.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1250px] border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/70">
              <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                Licitação
              </th>

              <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                Órgão
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                Local
              </th>

              <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                Modalidade
              </th>
              <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                Valor
              </th>

              <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                Publicação
              </th>

              <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                Oportunidade
              </th>

              <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                Ações
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-800/80">
            {licitacoes.map((licitacao) => {
              const score = getOpportunityScore(licitacao);

              return (
                <tr
                  key={licitacao.id}
                  className="group transition-colors hover:bg-zinc-900/50"
                >
                  <td className="px-5 py-4 align-top">
                    <div className="max-w-[380px]">
                      <p className="line-clamp-3 text-sm font-medium leading-5 text-white">
                        {licitacao.objeto}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        {licitacao.municipio ?? "Local não informado"} .{" "}
                        {licitacao.uf ?? "UF não informada"}
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-4 align-top">
                    <p className="max-w-[190px] truncate text-sm text-zinc-300">
                      {licitacao.orgao}
                    </p>
                  </td>

                  <td className="px-5 py-4 align-top">
                    <p className="text-sm text-zinc-300">
                      {licitacao.municipio ?? "Não informado"}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      {licitacao.uf ?? "UF não informada"}
                    </p>
                  </td>

                  <td className="px-5 py-4 align-top">
                    <span className="inline-flex rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-300">
                      {licitacao.modalidade ?? "Não informado"}
                    </span>
                  </td>

                  <td className="px-5 py-4 align-top">
                    <p className="whitespace-nowrap text-sm font-medium text-white">
                      {formatarValor(licitacao.valor_estimado)}
                    </p>
                  </td>

                  <td className="px-5 py-4 align-top">
                    <p className="whitespace-nowrap text-sm text-zinc-300">
                      {formatarData(licitacao.data_publicacao)}
                    </p>
                  </td>

                  <td className="px-5 py-4 align-top">
                    <div
                      className={`inline-flex flex-col rounded-lg border px-2.5 py-1.5 ${scoreClasses(
                        score,
                      )}`}
                    >
                      <span className="text-sm font-semibold">{score}</span>

                      <span className="text-[10px] uppercase tracking-wide opacity-80">
                        {scoreLabel(score)}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4 align-top">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        title="Ver detalhes"
                        className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        type="button"
                        title="Analisar oportunidade"
                        className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-violet-300"
                      >
                        <Bot size={16} />
                      </button>

                      <button
                        type="button"
                        title="Favoritar"
                        className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-amber-300"
                      >
                        <Star size={16} />
                      </button>

                      <button
                        type="button"
                        title="Monitorar"
                        className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-blue-300"
                      >
                        <Bell size={16} />
                      </button>

                      {licitacao.link_pncp ? (
                        <a
                          href={licitacao.link_pncp}
                          target="_blank"
                          rel="noreferrer"
                          title="Abrir no PNCP"
                          className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
                        >
                          <ExternalLink size={16} />
                        </a>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-zinc-800 px-5 py-3">
        <p className="text-xs text-zinc-500">
          {licitacoes.length} licitaç{licitacoes.length !== 1 ? "ões" : "ão"}
        </p>

        <p className="text-xs text-zinc-600">Dados provenientes do PNCP</p>
      </div>
    </div>
  );
}
