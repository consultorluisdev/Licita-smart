use rig::DynModel;
use rig::agent::{Agent, AgentBuilder};
use rig::operation::Completion;
use rig::providers::{ollama, openai};

use crate::config::{Config, LlmProvider};
use crate::error::AppError;

pub mod prompt;

pub fn build(config: &Config) -> Result<Agent, AppError> {
    let model: DynModel<Completion> = match config.llm_provider {
        LlmProvider::OpenAi => openai::OpenAI::from_env()
            .map_err(|e| AppError::Internal(e.to_string()))?
            .completion(config.llm_model.clone())
            .into(),
        LlmProvider::Ollama => ollama::Ollama::from_env()
            .map_err(|e| AppError::Internal(e.to_string()))?
            .completion(config.llm_model.clone())
            .into(),
    };

    Ok(AgentBuilder::new(model)
        .preamble(prompt::SYSTEM_PROMPT)
        .temperature(0.2)
        .max_tokens(700)
        .build())
}

pub async fn execute(agent: &Agent, message: &str) -> Result<String, AppError> {
    let response = agent
        .prompt(message)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    Ok(response.output())
}
