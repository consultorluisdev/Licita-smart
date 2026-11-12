use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};

use serde_json::json;

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("Erro interno: {0}")]
    Internal(String),

    #[error("Requisição inválida: {0}")]
    BadRequest(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            Self::Internal(message) => {
                tracing::error!("{message}");
                (
                    StatusCode::BAD_GATEWAY,
                    "Falha ao processar solicitação".to_string(),
                )
            }
            Self::BadRequest(message) => (StatusCode::BAD_REQUEST, message),
        };

        (
            status,
            Json(json!({
                "success": false,
                "error": message
            })),
        )
            .into_response()
    }
}
