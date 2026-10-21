use crate::agent::{interpretar_mensagem, montar_resposta};
use crate::db::salvar_licitacao;
use crate::error::AppError;
use crate::filters::is_ti_saas;
use crate::models::{BuscaResponse, ChatRequest, ChatResponse, Licitacao, LicitacoesQuery};
use crate::pncp::{buscar_propostas, mapear_licitacao};
use axum::{
    extract::{Query, State},
    Json,
};
use reqwest::Client;
use serde_json::{json, Value};
use sqlx::SqlitePool;
use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    pub pool: SqlitePool,
    pub http: Client,
}

pub async fn root() -> Json<Value> {
    Json(json!({
        "message": "Licita TI API (Rust) rodando",
        "endpoints": ["/health", "/licitacoes", "/chat"]
    }))
}

pub async fn health() -> Json<Value> {
    Json(json!({ "status": "ok" }))
}

pub async fn listar_licitacoes(
    State(state): State<Arc<AppState>>,
    Query(query): Query<LicitacoesQuery>,
) -> Result<Json<BuscaResponse>, AppError> {
    let pagina = query.pagina.unwrap_or(1).max(1);
    let tamanho = query.tamanho.unwrap_or(50).clamp(10, 50);
    let apenas_ti = query.apenas_ti.unwrap_or(true);

    let uf = query
        .uf
        .as_ref()
        .map(|s| s.trim().to_uppercase())
        .filter(|s| !s.is_empty());

    let itens = buscar_propostas(&state.http, uf.as_deref(), pagina, tamanho).await?;
    let tem_proxima_pagina = itens.len() == tamanho as usize;
    let mut resultados: Vec<Licitacao> = Vec::new();

    for item in &itens {
        let licitacao = mapear_licitacao(item);
        if apenas_ti && !is_ti_saas(&licitacao.objeto) {
            continue;
        }
        resultados.push(licitacao);
    }

    let total = resultados.len();

    Ok(Json(BuscaResponse {
        total,
        pagina,
        tamanho,
        tem_proxima_pagina,
        resultados,
    }))
}

pub async fn chat_agente(
    State(state): State<Arc<AppState>>,
    Json(body): Json<ChatRequest>,
) -> Result<Json<ChatResponse>, AppError> {
    let (uf, apenas_ti) = interpretar_mensagem(&body.message);

    let itens = buscar_propostas(&state.http, uf.as_deref(), 1, 50).await?;
    let mut resultados: Vec<Licitacao> = Vec::new();

    for item in &itens {
        let licitacao = mapear_licitacao(item);
        if apenas_ti && !is_ti_saas(&licitacao.objeto) {
            continue;
        }
        salvar_licitacao(&state.pool, &licitacao).await?;
        resultados.push(licitacao);
    }

    let total = resultados.len();
    let top: Vec<Licitacao> = resultados.into_iter().take(5).collect();
    let mut resposta = montar_resposta(total, uf.as_deref(), apenas_ti);

    if total > 5 {
        resposta.push_str(&format!("\nMostrando as 5 primeiras de {total}."));
    }

    Ok(Json(ChatResponse {
        resposta,
        licitacoes: top,
    }))
}
