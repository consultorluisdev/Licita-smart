pub mod handlers;

use axum::{
    Router,
    routing::{get, post},
};
use tower_http::cors::CorsLayer;

use crate::state::AppState;

pub fn routes(state: AppState) -> Router {
    Router::new()
        .route("/health", get(handlers::health))
        .route("/api/v1/chat", post(handlers::chat))
        .layer(CorsLayer::permissive())
        .with_state(state)
}
