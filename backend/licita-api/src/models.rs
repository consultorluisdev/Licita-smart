use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Licitacao {
    pub id: String,
    pub objeto: String,
    pub orgao: String,
    pub uf: Option<String>,
    pub municipio: Option<String>,
    pub valor_estimado: Option<f64>,
    pub modalidade: Option<String>,
    pub data_publicacao: Option<String>,
    pub data_limite: Option<String>,
    pub link_pncp: String,
    pub cnpj_orgao: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct BuscaResponse {
    pub total: usize,
    pub pagina: u32,
    pub tamanho: u32,
    pub tem_proxima_pagina: bool,
    pub resultados: Vec<Licitacao>,
}

#[derive(Debug, Deserialize)]
pub struct LicitacoesQuery {
    pub uf: Option<String>,
    pub pagina: Option<u32>,
    pub tamanho: Option<u32>,
    pub apenas_ti: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatRequest {
    pub message: String,
}

#[derive(Debug, Serialize)]
pub struct ChatResponse {
    pub resposta: String,
    pub licitacoes: Vec<Licitacao>,
}
