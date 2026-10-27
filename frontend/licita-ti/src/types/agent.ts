import type { Licitacao } from "./licitacao";

export interface ChatRequest{
    message: string;
}

export interface ChatResponse{
    reposta: string;
    licitacoes: Licitacao[];
}