mod agent;
mod config;
mod db;
mod error;
mod filters;
mod models;
mod pncp;
mod routes;

use axum::{
    routing::{get, post},
    Router,
};
use config::Config;
use routes::{chat_agente, health, listar_licitacoes, root, AppState};
use std::{net::SocketAddr, sync::Arc, time::Duration};
use tower_http::cors::{Any, CorsLayer};
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env().add_directive("info".parse()?))
        .init();

    let config = Config::from_env();
    let pool = db::connect(&config.database_url).await?;

    let http = reqwest::Client::builder()
        .timeout(Duration::from_secs(30))
        .user_agent("licita-ti-api-rust/0.1")
        .build()?;

    let state = Arc::new(AppState { pool, http });

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/", get(root))
        .route("/health", get(health))
        .route("/licitacoes", get(listar_licitacoes))
        .route("/chat", post(chat_agente))
        .with_state(state)
        .layer(cors);

    let addr = SocketAddr::from(([0, 0, 0, 0], config.port));
    tracing::info!("Licita Agent rodando em http://localhost:{}", config.port);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
