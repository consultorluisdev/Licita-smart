using LicitaSmart.Api.Features.Licitacoes.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace LicitaSmart.Api.Features.Licitacoes;

[ApiController]
[Route("licitacoes")]
[Route("api/licitacoes")]
public class LicitacoesController : ControllerBase
{
  private readonly LicitacaoService _service;

  public LicitacoesController(LicitacaoService service)
  {
    _service = service;
  }

  [HttpGet]
  public async Task<IActionResult> Buscar(
      [FromQuery] LicitacaoQuery query,
      CancellationToken cancellationToken)
  {
    var resultado = await _service.BuscarAsync(
        query,
        cancellationToken);

    return Ok(resultado);
  }

  [HttpGet("{id:guid}")]
  public async Task<IActionResult> ObterPorId(
      Guid id,
      CancellationToken cancellationToken)
  {
    var resultado = await _service.ObterPorIdAsync(
        id,
        cancellationToken);

    if (resultado is null)
    {
      return NotFound(new
      {
        message = "Licitação não encontrada."
      });
    }

    return Ok(resultado);
  }
}
