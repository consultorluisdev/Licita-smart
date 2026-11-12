use rig::agent::Agent;

use crate::config::Config;

#[derive(Clone)]
pub struct AppState {
    pub agent: Agent,
    pub agent_name: String,
    pub provider: String,
    pub model: String,
}

impl AppState {
    pub fn new(config: &Config, agent: Agent) -> Self {
        Self {
            agent,
            agent_name: "Licita Smart Agent".to_string(),
            provider: config.llm_provider.as_str().to_string(),
            model: config.llm_model.clone(),
        }
    }
}
