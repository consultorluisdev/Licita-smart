import type { Opportunity } from "../types";
import { brl } from "../utils/format";

interface LicitationTableProps {
  opportunities: Opportunity[];
  compact?: boolean;
}

function formatDeadline(value: string | null) {
  if (!value) return "Não informado";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeZone: "UTC",
  }).format(date);
}

export function LicitationTable({
  opportunities,
  compact = false,
}: LicitationTableProps) {
  if (opportunities.length === 0) {
    return (
      <p className="p-8 text-center text-sm text-slate-500">
        A API não retornou licitações para esta consulta.
      </p>
    );
  }

  return (
    <div className="scrollbar overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead className="bg-white/[.02] text-xs text-slate-500">
          <tr>
            <th className="px-5 py-3 font-medium">Objeto</th>
            <th className="px-5 py-3 font-medium">Órgão</th>
            {!compact && <th className="px-5 py-3 font-medium">Local</th>}
            <th className="px-5 py-3 font-medium">Valor estimado</th>
            <th className="px-5 py-3 font-medium">Prazo</th>
            <th className="px-5 py-3 font-medium">Edital</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#242833]">
          {opportunities.map((opportunity) => (
            <tr key={opportunity.id} className="align-top transition hover:bg-white/[.02]">
              <td className="max-w-md px-5 py-4">
                <p className="line-clamp-2 font-medium text-slate-200">
                  {opportunity.title}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {opportunity.category}
                </p>
              </td>
              <td className="max-w-[220px] px-5 py-4 text-slate-400">
                <span className="line-clamp-2">{opportunity.agency}</span>
              </td>
              {!compact && (
                <td className="px-5 py-4 text-slate-400">
                  {opportunity.location}
                </td>
              )}
              <td className="whitespace-nowrap px-5 py-4 text-slate-300">
                {opportunity.value === null
                  ? "Não informado"
                  : brl(opportunity.value)}
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-slate-400">
                {formatDeadline(opportunity.deadline)}
              </td>
              <td className="px-5 py-4">
                {opportunity.sourceUrl ? (
                  <a
                    href={opportunity.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-sky-300 hover:text-sky-200"
                  >
                    Abrir PNCP
                  </a>
                ) : (
                  <span className="text-slate-600">Indisponível</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
