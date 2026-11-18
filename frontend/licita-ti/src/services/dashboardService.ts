import type { Opportunity } from "../types";
import type { DashboardOverview } from "../types/dashboard";
import type { Licitacao } from "../types/licitacao";
import { brl } from "../utils/format";
import { listarLicitacoes } from "./licitacaoService";

type ProcurementCategory =
  | "Tecnologia / TI"
  | "SaaS / Cloud"
  | "Saúde"
  | "Obras e Engenharia"
  | "Alimentação"
  | "Transporte"
  | "Serviços"
  | "Materiais"
  | "Segurança"
  | "Educação"
  | "Meio Ambiente"
  | "Outros";

const categoryRules: {
  category: ProcurementCategory;
  pattern: RegExp;
}[] = [
  {
    category: "SaaS / Cloud",
    pattern:
      /\bsaas\b|\bcloud\b|\bnuvem\b|hospedagem de (?:sistemas?|softwares?)|data ?center|datacenter/,
  },
  {
    category: "Segurança",
    pattern:
      /ciberseguranca|seguranca da informacao|seguranca eletronica|\bvigilancia\b|\balarme\b|botao do panico|controle de acesso|\bcftv\b|cameras? de seguranca|seguranca patrimonial/,
  },
  {
    category: "Alimentação",
    pattern:
      /generos alimenticios|\brefeicoes?\b|\bmerenda\b|\balimentos?\b|\bcestas basicas\b|\bracao\b|\balimentacao\b/,
  },
  {
    category: "Serviços",
    pattern:
      /\bretifica\b|manutencao mecanica|manutencao de veiculos?|reparo de veiculos?/,
  },
  {
    category: "Materiais",
    pattern:
      /\b(?:aquisicao|fornecimento|fornecer|registro de precos)\b.*\b(?:vigas?|cascalho|madeira|mobiliario|flores|mudas|plantas|varredeiras?|substratos|vasos|ferramentas?|pecas?|materiais?|insumos?)\b/,
  },
  {
    category: "Meio Ambiente",
    pattern:
      /residuos|coleta de lixo|coleta seletiva|\besgoto\b|\bsaneamento\b|fossas? septicas?|efluentes|hidrojateamento|limpeza urbana|paisagismo|reflorestamento|plantas paisagisticas|areas verdes/,
  },
  {
    category: "Educação",
    pattern:
      /\bensino\b|escolas?|creches?|socioeducativo|material didatico|capacitacao|treinamento|cursos?|formacao profissional|oficina de (?:artes|musica|danca|macrame)/,
  },
  {
    category: "Tecnologia / TI",
    pattern:
      /tecnologia da informacao|informatica|\bsoftwares?\b|\bhardwares?\b|computadores?|notebooks?|sistemas? informatizados?|sistema de gestao|sistema de informacao|desenvolvimento de sistemas|aplicativos?|solucao tecnologica|licencas? de software|redes? de computadores/,
  },
  {
    category: "Obras e Engenharia",
    pattern:
      /\bconstrucao\b|\bengenharia\b|\bbarragem\b|\bpavimentacao\b|\bedificacao\b|reforma predial|\benrocamento\b|\bdrenagem\b|\bcalcamento\b|\brevestimento\b|projeto (?:basico|executivo)|execucao de obras?|obras? de construcao|mao de obra de (?:pedreiro|servente|pintor)|servicos? de (?:pedreiro|servente|engenharia)/,
  },
  {
    category: "Transporte",
    pattern:
      /passagens? (?:aereas?|rodoviarias?)|veiculos?|motocicletas?|onibus|frotas?|combustiveis?|manutencao mecanica|mobilidade urbana|servicos? de transporte|transporte escolar/,
  },
  {
    category: "Saúde",
    pattern:
      /laboratorios?|exames?|medicamentos?|farmacos?|vacinas?|seringas?|lancetas?|insulina|ultrassonografia|ambulatorial|odontolog|psicolog|equoterapia|oxigenio|fisioterapia|protes(?:e|es)|procedimentos? (?:medicos|clinicos)|formula(?:s)? alimentares?|servicos? hospitalares?|atendimento hospitalar/,
  },
  {
    category: "Serviços",
    pattern:
      /prestacao de servicos?|servicos? tecnicos?|consultoria|assessoria|credenciamento|leiloeiro|agenciamento|locacao|manutencao|limpeza|operacionalizacao|intermediacao|servicos? funerarios|servicos? juridicos?|divulgacao|maquiagem|confeccao|restauracao|diagnostico socioterritorial/,
  },
  {
    category: "Materiais",
    pattern:
      /\b(?:aquisicao|fornecimento|fornecer|registro de precos)\b|materiais? de consumo|equipamentos? (?:de|para)|insumos? (?:de|para)/,
  },
];

function categorize(title: string): ProcurementCategory {
  const normalized = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return (
    categoryRules.find(({ pattern }) => pattern.test(normalized))?.category ??
    "Outros"
  );
}

function mapOpportunity(item: Licitacao): Opportunity {
  const location = [item.municipio, item.uf].filter(Boolean).join(" / ");

  return {
    id: item.id,
    title: item.objeto,
    agency: item.orgao,
    location: location || "Local não informado",
    value: item.valor_estimado,
    deadline: item.data_limite,
    category: categorize(item.objeto),
    sourceUrl: item.link_pncp || undefined,
  };
}

export async function getDashboard(): Promise<DashboardOverview> {
  const data = await listarLicitacoes({ pagina: 1, tamanho: 50 });
  const opportunities = data.resultados.map(mapOpportunity);
  const withValues = opportunities.filter(
    (opportunity): opportunity is Opportunity & { value: number } =>
      opportunity.value !== null && Number.isFinite(opportunity.value),
  );
  const totalValue = withValues.reduce(
    (total, opportunity) => total + opportunity.value,
    0,
  );
  const agencies = new Set(opportunities.map((opportunity) => opportunity.agency));
  const states = new Set(
    data.resultados
      .map((item) => item.uf?.trim().toUpperCase())
      .filter((uf): uf is string => Boolean(uf)),
  );
  const categories = new Map<string, number>();

  for (const opportunity of opportunities) {
    categories.set(
      opportunity.category,
      (categories.get(opportunity.category) ?? 0) + 1,
    );
  }

  const categoryDistribution = Array.from(categories, ([category, count]) => ({
    category,
    count,
    percentage: opportunities.length
      ? Math.round((count / opportunities.length) * 100)
      : 0,
  })).sort((a, b) => b.count - a.count);

  const topValues = withValues
    .slice()
    .sort((a, b) => b.value - a.value)
    .slice(0, 7);
  const highestValue = topValues[0]?.value ?? 0;

  const opportunityTrend = topValues.map((opportunity, index) => ({
    id: opportunity.id,
    label: String(index + 1),
    title: opportunity.title,
    value: opportunity.value,
    height: highestValue > 0
      ? Math.max(8, Math.round((opportunity.value / highestValue) * 100))
      : 0,
  }));

  const formatCount = (value: number) =>
    new Intl.NumberFormat("pt-BR").format(value);

  return {
    metrics: [
      {
        id: "licitacoes",
        label: "Licitações recebidas",
        value: formatCount(opportunities.length),
        detail: `Página ${data.pagina}`,
      },
      {
        id: "orgaos",
        label: "Órgãos",
        value: formatCount(agencies.size),
        detail: "Com licitações nesta página",
      },
      {
        id: "estados",
        label: "Estados",
        value: formatCount(states.size),
        detail: "UFs identificadas",
      },
      {
        id: "comValor",
        label: "Com valor estimado",
        value: formatCount(withValues.length),
        detail: "Informado pelo PNCP",
      },
      {
        id: "comPrazo",
        label: "Com prazo informado",
        value: formatCount(
          data.resultados.filter((item) => Boolean(item.data_limite)).length,
        ),
        detail: "Data limite disponível",
      },
      {
        id: "valorTotal",
        label: "Valor estimado",
        value: brl(totalValue),
        detail: "Soma dos valores nesta página",
      },
    ],
    opportunityTrend,
    categoryDistribution,
    opportunities,
  };
}