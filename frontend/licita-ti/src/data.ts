import type {
  Licitation,
  Opportunity,
} from "./types";

export const licitations: Licitation[] = [
  {
    id: "LIC-001",
    edital: "PE 042/2026",
    objeto:
      "Contratação de solução SaaS para gestão de processos e atendimento digital",
    orgao:
      "Prefeitura Municipal de Florianópolis",
    municipio: "Florianópolis",
    uf: "SC",
    modalidade: "Pregão Eletrônico",
    valor: 420000,
    dataPublicacao: "14/10/2026",
    prazo: "28/10/2026",
    status: "active",
    score: 94,
    categoria: "Software / SaaS",
  },

  {
    id: "LIC-002",
    edital: "PE 117/2026",
    objeto:
      "Aquisição de plataforma de análise de dados e indicadores",
    orgao:
      "Governo do Estado de Santa Catarina",
    municipio: "Florianópolis",
    uf: "SC",
    modalidade: "Pregão Eletrônico",
    valor: 185000,
    dataPublicacao: "13/10/2026",
    prazo: "24/10/2026",
    status: "active",
    score: 89,
    categoria: "Dados / BI",
  },

  {
    id: "LIC-003",
    edital: "CC 031/2026",
    objeto:
      "Serviços especializados de desenvolvimento e manutenção de sistemas",
    orgao:
      "Município de Joinville",
    municipio: "Joinville",
    uf: "SC",
    modalidade: "Concorrência",
    valor: 780000,
    dataPublicacao: "10/10/2026",
    prazo: "31/10/2026",
    status: "active",
    score: 86,
    categoria: "Desenvolvimento",
  },

  {
    id: "LIC-004",
    edital: "PE 088/2026",
    objeto:
      "Solução de segurança cibernética e monitoramento de infraestrutura",
    orgao:
      "Prefeitura de Blumenau",
    municipio: "Blumenau",
    uf: "SC",
    modalidade: "Pregão Eletrônico",
    valor: 310000,
    dataPublicacao: "09/10/2026",
    prazo: "21/10/2026",
    status: "active",
    score: 81,
    categoria: "Cybersecurity",
  },

  {
    id: "LIC-005",
    edital: "PE 204/2026",
    objeto:
      "Contratação de serviços de computação em nuvem",
    orgao:
      "Secretaria de Administração do Paraná",
    municipio: "Curitiba",
    uf: "PR",
    modalidade: "Pregão Eletrônico",
    valor: 1250000,
    dataPublicacao: "08/10/2026",
    prazo: "29/10/2026",
    status: "active",
    score: 78,
    categoria: "Cloud",
  },
];

export const opportunities: Opportunity[] =
  licitations.map((item) => ({
    id: item.id,
    title: item.objeto,
    agency: item.orgao,
    location: `${item.municipio} / ${item.uf}`,
    value: item.valor,
    deadline: item.prazo,
    score: item.score,
    category: item.categoria,
  }));