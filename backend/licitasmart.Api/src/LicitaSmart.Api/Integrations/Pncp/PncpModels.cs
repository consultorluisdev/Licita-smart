namespace LicitaSmart.Api.Integrations.Pncp;

public sealed record PncpPage(
  IReadOnlyList<PncpContratacao> Contratacoes,
  int TotalPaginas
);

public sealed class PncpContratacao
{
  public string? NumeroControlePNCP { get; set; }

  public string? Cnpj { get; set; }

  public string? RazaoSocial { get; set; }

  public string? NomeFantasia { get; set; }

  public string? UF { get; set; }

  public string? Municipio { get; set; }

  public string? ObjetoCompra { get; set; }

  public string? ModalidadeNome { get; set; }

  public string? Situacao { get; set; }

  public decimal? ValorEstimado { get; set; }

  public DateTime? DataPublicacao { get; set; }

  public DateTime? DataEncerramentoProposta { get; set; }

  public string? NumeroCompra { get; set; }

  public int? AnoCompra { get; set; }

  public int? SequencialCompra { get; set; }

  public bool SRP { get; set; }

  public string? LinkSistemaOrigem { get; set; }
}
