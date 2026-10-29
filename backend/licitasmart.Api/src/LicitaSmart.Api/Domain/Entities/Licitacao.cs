namespace LicitaSmart.Api.Domain.Entities;

public class Licitacao
{
  public Guid Id { get; set; }

  public string PncpId { get; set; } = string.Empty;

  public Guid OrgaoId { get; set; }

  public Orgao Orgao { get; set; } = null!;

  public string Objeto { get; set; } = string.Empty;

  public string UF { get; set; } = string.Empty;

  public string Municipio { get; set; } = string.Empty;

  public string? Modalidade { get; set; }

  public string? Situacao { get; set; }

  public decimal? ValorEstimado { get; set; }

  public DateTime? DataPublicacao { get; set; }

  public DateTime? DataLimite { get; set; }

  public string? NumeroProcesso { get; set; }

  public string LinkPncp { get; set; } = string.Empty;

  public bool SRP { get; set; }

  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

  public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

  public ICollection<Favorito> Favoritos { get; set; } = new List<Favorito>();
}
