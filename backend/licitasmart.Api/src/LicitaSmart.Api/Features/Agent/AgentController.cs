using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace LicitaSmart.Api.Features.Agent;

public sealed record ChatRequest(string Message);

[ApiController]
[Route("api/v1/chat")]
public sealed class AgentController : ControllerBase
{
  private readonly AgentService _agent;
  private readonly ILogger<AgentController> _logger;

  public AgentController(AgentService agent, ILogger<AgentController> logger)
  {
    _agent = agent;
    _logger = logger;
  }

  [HttpPost]
  public async Task<IActionResult> Chat(
      [FromBody] ChatRequest request,
      CancellationToken cancellationToken)
  {
    var mensagem = request?.Message?.Trim() ?? string.Empty;

    if (mensagem.Length == 0)
    {
      return BadRequest(new
      {
        success = false,
        error = "A mensagem não pode estar vazia"
      });
    }

    if (mensagem.Length > 4000)
    {
      return BadRequest(new
      {
        success = false,
        error = "A mensagem excede o limite de 4000 caracteres"
      });
    }

    try
    {
      var resposta = await _agent.ExecuteAsync(mensagem, cancellationToken);

      return Ok(new
      {
        success = true,
        agent = AgentService.AgentName,
        response = resposta
      });
    }
    catch (Exception ex) when (ex is HttpRequestException
        or TaskCanceledException
        or JsonException
        or InvalidOperationException)
    {
      _logger.LogError(ex, "Falha ao consultar o agente ({Provider}/{Model})", _agent.Provider, _agent.Model);

      return StatusCode(StatusCodes.Status503ServiceUnavailable, new
      {
        success = false,
        error = "Agente indisponível. Verifique se o Ollama está rodando ou se Agent:OpenAiApiKey está configurada."
      });
    }
  }
}
