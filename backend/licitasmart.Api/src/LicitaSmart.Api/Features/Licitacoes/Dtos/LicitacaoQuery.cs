namespace LicitaSmart.Api.Features.Licitacoes.Dtos;

public class LicitacaoQuery
{
  public string? UF { get; set; }

  public string? Municipio { get; set; }

  public string? Orgao { get; set; }

  public string? Modalidade { get; set; }

  public string? Situacao { get; set; }

  public int Page { get; set; } = 1;

  public int PageSize { get; set; } = 20;
}
