use std::env;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum LlmProvider {
    OpenAi,
    Ollama,
}

impl LlmProvider {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::OpenAi => "openai",
            Self::Ollama => "ollama",
        }
    }

    fn default_model(self) -> &'static str {
        match self {
            Self::OpenAi => "gpt-5.5",
            Self::Ollama => "gemma3:4b",
        }
    }
}

#[derive(Clone)]
pub struct Config {
    pub host: String,
    pub port: u16,
    pub llm_provider: LlmProvider,
    pub llm_model: String,
}

impl Config {
    pub fn from_env() -> anyhow::Result<Self> {
        let host = env::var("APP_HOST").unwrap_or_else(|_| "127.0.0.1".to_string());

        let port = env::var("APP_PORT")
            .unwrap_or_else(|_| "8082".to_string())
            .parse::<u16>()?;

        let llm_provider = match env::var("LLM_PROVIDER")
            .unwrap_or_else(|_| "ollama".to_string())
            .trim()
            .to_ascii_lowercase()
            .as_str()
        {
            "openai" => LlmProvider::OpenAi,
            "ollama" => LlmProvider::Ollama,
            other => anyhow::bail!("LLM_PROVIDER inválido: {other} (use 'openai' ou 'ollama')"),
        };

        let llm_model = env::var("LLM_MODEL")
            .ok()
            .map(|model| model.trim().to_string())
            .filter(|model| !model.is_empty())
            .unwrap_or_else(|| llm_provider.default_model().to_string());

        if llm_provider == LlmProvider::OpenAi && env::var("OPENAI_API_KEY").is_err() {
            anyhow::bail!("OPENAI_API_KEY não configurado (necessário com LLM_PROVIDER=openai)");
        }

        Ok(Self {
            host,
            port,
            llm_provider,
            llm_model,
        })
    }

    pub fn address(&self) -> String {
        format!("{}:{}", self.host, self.port)
    }
}
