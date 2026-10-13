use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;

#[derive(Debug)]
pub enum AppError {
    Anyhow(anyhow::Error),
    Message(StatusCode, String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, msg) = match self {
            AppError::Anyhow(err) => {
                tracing::error!("erro interno: {err:?}");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "erro interno do servidor".to_string(),
                )
            }
            AppError::Message(status, msg) => (status, msg),
        };
        (status, Json(json!({ "detail": msg }))).into_response()
    }
}

impl From<anyhow::Error> for AppError {
    fn from(err: anyhow::Error) -> Self {
        AppError::Anyhow(err)
    }
}

impl From<sqlx::Error> for AppError {
    fn from(err: sqlx::Error) -> Self {
        AppError::Anyhow(err.into())
    }
}

impl From<reqwest::Error> for AppError {
    fn from(err: reqwest::Error) -> Self {
        AppError::Anyhow(err.into())
    }
}
