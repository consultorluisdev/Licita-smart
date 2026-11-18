using LicitaSmart.Api.Integrations.Pncp;

namespace LicitaSmart.Tests;

public sealed class PncpScheduleTests
{
  [Fact]
  public void CalcularProximaExecucao_AntesDoHorario_RetornaHoje()
  {
    var agora = new DateTime(2026, 11, 18, 19, 0, 0);

    var resultado = PncpSchedule.CalcularProximaExecucao(
        agora,
        new TimeSpan(20, 0, 0));

    Assert.Equal(
        new DateTime(2026, 11, 18, 20, 0, 0),
        resultado);
  }

  [Fact]
  public void CalcularProximaExecucao_AposHorario_RetornaAmanha()
  {
    var agora = new DateTime(2026, 11, 18, 21, 0, 0);

    var resultado = PncpSchedule.CalcularProximaExecucao(
        agora,
        new TimeSpan(20, 0, 0));

    Assert.Equal(
        new DateTime(2026, 11, 19, 20, 0, 0),
        resultado);
  }

  [Fact]
  public void CalcularProximaExecucao_HorarioInvalido_LancaExcecao()
  {
    Assert.Throws<ArgumentOutOfRangeException>(
        () => PncpSchedule.CalcularProximaExecucao(
            DateTime.Now,
            TimeSpan.FromDays(1)));
  }
}
