mod agent;
mod api;
mod config;
mod error;
mod state;

use tracing_subscriber::EnvFilter;

fn load_env() {
    let _ = dotenvy::dotenv();
    let _ = dotenvy::from_filename("agents/licita-smart-agent/.env");
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    load_env();

    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")),
        )
        .init();

    let config = config::Config::from_env()?;
    let address = config.address();
    let agent = agent::build(&config)?;
    let state = state::AppState::new(&config, agent);

    let listener = tokio::net::TcpListener::bind(&address).await?;

    tracing::info!(
        "Licita Smart Agent iniciado em {} (provider={}, model={})",
        address,
        config.llm_provider.as_str(),
        config.llm_model
    );

    axum::serve(listener, api::routes(state)).await?;

    Ok(())
}
