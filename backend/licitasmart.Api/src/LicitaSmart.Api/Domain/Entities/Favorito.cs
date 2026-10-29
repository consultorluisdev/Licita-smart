namespace LicitaSmart.Api.Domain.Entities;

public class Favorito
{
  public Guid Id { get; set; }

  public Guid UsuarioId { get; set; }

  public Usuario Usuario { get; set; } = null!;

  public Guid LicitacaoId { get; set; }

  public Licitacao Licitacao { get; set; } = null!;

  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
