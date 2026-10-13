export interface Licitacao {
    id: string;
    objeto: string;
    orgao: string;
    uf?: string;
    municipio?: string;
    valor_estimado?: number;
    modalidade?: string;
    data_publicacao?: string;
    data_limite?: string;
    link_pncp: string;
    cnpj_orgao?: string;
}

export interface ChatResponse {
    resposta: string;
    licitacoes: Licitacao[];
}

export interface LicitacoesResponse {
    total: number;
    pagina: number;
    resultados: Licitacao[];
}

export interface HealthResponse {
    status: string;
}

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    licitacoes?: Licitacao[];
    timestamp: Date;
}