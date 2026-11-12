use axum::{Json, extract::State};
use serde::{Deserialize, Serialize};

use crate::{agent, error::AppError, state::AppState};

#[derive(Deserialize)]
pub struct ChatRequest {
    pub message: String,
}

#[derive(Serialize)]
pub struct ChatResponse {
    pub success: bool,
    pub agent: String,
    pub response: String,
}

pub async fn health(State(state): State<AppState>) -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "status": "ok",
        "service": "licita-smart-agent",
        "provider": state.provider,
        "model": state.model
    }))
}

pub async fn chat(
    State(state): State<AppState>,
    Json(request): Json<ChatRequest>,
) -> Result<Json<ChatResponse>, AppError> {
    let message = request.message.trim();

    if message.is_empty() {
        return Err(AppError::BadRequest(
            "A mensagem não pode estar vazia".to_string(),
        ));
    }

    if message.chars().count() > 4000 {
        return Err(AppError::BadRequest(
            "A mensagem excede o limite de 4000 caracteres".to_string(),
        ));
    }

    let response = agent::execute(&state.agent, message).await?;

    Ok(Json(ChatResponse {
        success: true,
        agent: state.agent_name,
        response,
    }))
}
