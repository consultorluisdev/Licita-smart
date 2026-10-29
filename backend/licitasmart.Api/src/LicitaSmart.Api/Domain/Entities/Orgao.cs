namespace LicitaSmart.Api.Domain.Entities;

public class Orgao
{
  public Guid Id { get; set; }
  public string Cnpj { get; set; } = string.Empty;

  public string RazaoSocial { get; set; } = string.Empty;

  public string? NomeFantasia { get; set; }

  public string UF { get; set; } = string.Empty;

  public string Municipio { get; set; } = string.Empty;

  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

  public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

  public ICollection<Licitacao> Licitacoes { get; set; } = new List<Licitacao>();
}
