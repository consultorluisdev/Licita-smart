namespace LicitaSmart.Api.Integrations.Pncp;

public static class PncpSchedule
{
  public static DateTime CalcularProximaExecucao(
      DateTime agora,
      TimeSpan horario)
  {
    if (horario < TimeSpan.Zero ||
        horario >= TimeSpan.FromDays(1))
    {
      throw new ArgumentOutOfRangeException(nameof(horario));
    }

    var execucaoHoje = agora.Date.Add(horario);

    return execucaoHoje >= agora
        ? execucaoHoje
        : execucaoHoje.AddDays(1);
  }
}
