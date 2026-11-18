namespace LicitaSmart.Api.Integrations.Pncp;

public sealed class PncpOptions
{
  public bool Habilitado { get; set; } = true;

  public string BaseUrl { get; set; } = "https://pncp.gov.br/api/consulta/";

  public string? UF { get; set; }

  public int DiasHorizonte { get; set; } = 60;

  public int TamanhoPagina { get; set; } = 50;

  public TimeSpan HorarioExecucao { get; set; } = new(20, 0, 0);

  public int MaxPaginasPorExecucao { get; set; } = 20;
}
