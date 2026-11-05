namespace LicitaSmart.Api.Integrations.Pncp;

public sealed class PncpOptions
{
  public bool Habilitado { get; set; } = true;

  public string BaseUrl { get; set; } = "https://pncp.gov.br/api/consulta/";

  public string UF { get; set; } = "SC";

  public int DiasHorizonte { get; set; } = 60;

  public int TamanhoPagina { get; set; } = 50;

  public int IntervaloMinutos { get; set; } = 360;

  public int MaxPaginasPorExecucao { get; set; } = 20;
}
