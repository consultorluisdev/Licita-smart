using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Options;

namespace LicitaSmart.Api.Features.Agent;

/// <summary>
/// Agente de apoio a análise de licitações.
/// Antes era um serviço Rust separado (porta 8082); agora roda dentro da API,
/// atendendo o mesmo contrato: POST /api/v1/chat -> { success, agent, response }.
/// </summary>
public sealed class AgentService
{
  public const string AgentName = "Licita Smart Agent";

  private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

  private readonly HttpClient _httpClient;
  private readonly AgentOptions _options;
  private readonly ILogger<AgentService> _logger;

  public AgentService(
      HttpClient httpClient,
      IOptions<AgentOptions> options,
      ILogger<AgentService> logger)
  {
    _httpClient = httpClient;
    _options = options.Value;
    _logger = logger;
  }

  public string Provider => _options.Provider;

  public string Model => _options.Model;

  public async Task<string> ExecuteAsync(string message, CancellationToken cancellationToken)
  {
    return _options.Provider.Trim().ToLowerInvariant() switch
    {
      "openai" => await ExecutarOpenAiAsync(message, cancellationToken),
      "ollama" => await ExecutarOllamaAsync(message, cancellationToken),
      var outro => throw new InvalidOperationException(
          $"Agent:Provider inválido: '{outro}' (use 'openai' ou 'ollama').")
    };
  }

  private async Task<string> ExecutarOllamaAsync(string message, CancellationToken cancellationToken)
  {
    var payload = new
    {
      model = _options.Model,
      stream = false,
      options = new
      {
        temperature = _options.Temperature,
        num_predict = _options.MaxTokens
      },
      messages = Mensagens(message)
    };

    var url = $"{_options.OllamaBaseUrl.TrimEnd('/')}/api/chat";

    using var response = await _httpClient.PostAsJsonAsync(url, payload, JsonOptions, cancellationToken);
    response.EnsureSuccessStatusCode();

    var resultado = await response.Content.ReadFromJsonAsync<OllamaChatResponse>(JsonOptions, cancellationToken);

    var texto = resultado?.Message?.Content?.Trim();

    if (string.IsNullOrWhiteSpace(texto))
    {
      throw new InvalidOperationException("O Ollama retornou uma resposta vazia.");
    }

    return texto;
  }

  private async Task<string> ExecutarOpenAiAsync(string message, CancellationToken cancellationToken)
  {
    if (string.IsNullOrWhiteSpace(_options.OpenAiApiKey))
    {
      throw new InvalidOperationException(
          "Agent:OpenAiApiKey não configurada (necessário com Agent:Provider=openai).");
    }

    var payload = new
    {
      model = _options.Model,
      temperature = _options.Temperature,
      max_tokens = _options.MaxTokens,
      messages = Mensagens(message)
    };

    var url = $"{_options.OpenAiBaseUrl.TrimEnd('/')}/chat/completions";

    using var request = new HttpRequestMessage(HttpMethod.Post, url)
    {
      Content = JsonContent.Create(payload, options: JsonOptions)
    };

    request.Headers.Authorization =
        new AuthenticationHeaderValue("Bearer", _options.OpenAiApiKey);

    using var response = await _httpClient.SendAsync(request, cancellationToken);

    if (!response.IsSuccessStatusCode)
    {
      var corpo = await response.Content.ReadAsStringAsync(cancellationToken);
      _logger.LogWarning("OpenAI respondeu {Status}: {Corpo}", (int)response.StatusCode, corpo);
      response.EnsureSuccessStatusCode();
    }

    var resultado = await response.Content.ReadFromJsonAsync<OpenAiChatResponse>(JsonOptions, cancellationToken);

    var texto = resultado?.Choices?.FirstOrDefault()?.Message?.Content?.Trim();

    if (string.IsNullOrWhiteSpace(texto))
    {
      throw new InvalidOperationException("A OpenAI retornou uma resposta vazia.");
    }

    return texto;
  }

  private static object[] Mensagens(string message) =>
  [
    new { role = "system", content = AgentPrompt.System },
    new { role = "user", content = message }
  ];

  private sealed record OllamaChatResponse(OllamaMessage? Message);

  private sealed record OllamaMessage(string? Content);

  private sealed record OpenAiChatResponse(List<OpenAiChoice>? Choices);

  private sealed record OpenAiChoice(OpenAiMessage? Message);

  private sealed record OpenAiMessage(string? Content);
}
