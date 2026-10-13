import type { Licitacao } from "../types";

interface LicitacaoCardProps {
    licitacao: Licitacao;
}

function formatCurrency(value?: number){
    if(value === undefined || value === null){
        return "Não informado";
    }

    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(value);
}

function formatDate(date?: string){
    if(!date){
        return null;
    }

    const parsed = new Date(date)

    if(Number.isNaN(parsed.getTime())){
        return date;
    }

    return new Intl.DateTimeFormat("pt-BR").format(parsed);
}

export function LicitacaoCard({
    licitacao
}: LicitacaoCardProps){
    const location = [
        licitacao.municipio,
        licitacao.uf
    ]
    .filter(Boolean)
    .join(" / ");

    return(
        <article className="group roundend-2xl border-white/[0.08] bg-white/[0.35] p-5 transition duration-200 hover:border-blue-400/30 hover:bg-white/[0.055] hover:shadow-card">
            <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                    {licitacao.uf &&(
                        <span className="rounded-md border border-blue-400/20 bg-blue-500/20 px-2 py-1 text[11px] font-semibold uppercase tracking-white text-blue-300">
                            {licitacao.uf}
                        </span>
                    )}
                    {licitacao.modalidade &&(
                        <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[11px] font-medium text-slate-400">
                            {licitacao.modalidade}
                        </span>
                    )}
                </div>
                <h3 className="text-sm font-semibold leading-6 text-white">
                    {licitacao.objeto}
                </h3>
            </div>

            <div className="space-y-3 text-sm">
                <div>
                    <span className="text-xs uppercase tracking-wider text-slate-500">
                        Órgão
                    </span>

                    <p className="mt-1 text-slate-300">
                        {licitacao.orgao}
                    </p>
                </div>
            </div>

            {location &&(
                <div>
                    <span className="text-xs uppercase tracking-wider text-slate-500">
                        Localização
                    </span>

                    <p className="mt-1 text-slate-300">
                        {location}
                    </p>
                </div>
            )}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                    <span className="text-xs uppercase tracking-wider text-slate-500">
                        Valor estimado
                    </span>

                    <p className="mt-1 font-semibold text-emerald-400">
                        {formatCurrency(
                            licitacao.valor_estimado
                        )}
                    </p>
                </div>
                {licitacao.data_limite &&(
                    <div>
                        <span className="text-xs uppercase tracking-wider text-slate-500">
                            Data limite
                        </span>

                        <p className="mt-1 text-slate-300">
                            {formatDate(
                                licitacao.data_limite
                            )}
                        </p>
                    </div>
                )}
            </div>
            <div className="mt-5 border-t border-white/[0.06] pt-4">
            <a href={licitacao.link_pncp}
            target="_black"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300 transition hover:bg-blue-500/20 hover:text-blue-200">
                Ver no PNCP
                <span aria-hidden="true">↗</span>
            </a>
            </div>
        </article>
    )
}