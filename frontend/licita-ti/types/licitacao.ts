export interface Licitacao {
    id: string;
    objeto: string;
    orgao: string;
    uf: string | null;
    municipio: string | null;
    valor_estimado: number | null;
    modalidade: string | null;
    data_publicacao: string | null;
    data_limite: string | null;
    link_pncp: string;
    cnpj_orgao: string | null;
}

export interface BuscaReponse {
    total: number;
    pagina: number;
    tamanho: number;
    total_paginas: number;
    resultados: Licitacao[];
}

export interface LicitacaoesParams {
    uf?: string;
    pagina?: number;
    tamanho?: number;
    apenas_ti?: boolean;
}