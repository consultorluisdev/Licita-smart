namespace LicitaSmart.Api.Features.Agent;

public sealed class AgentOptions
{
  public const string SectionName = "Agent";

  public string Provider { get; set; } = "ollama";

  public string Model { get; set; } = "gemma3:4b";

  public string OllamaBaseUrl { get; set; } = "http://localhost:11434";

  public string OpenAiBaseUrl { get; set; } = "https://api.openai.com/v1";

  public string? OpenAiApiKey { get; set; }

  public double Temperature { get; set; } = 0.2;

  public int MaxTokens { get; set; } = 700;

  public int TimeoutSeconds { get; set; } = 180;
}
