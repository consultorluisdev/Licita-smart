namespace LicitaSmart.Api.Integrations.Pncp;

public interface IPncpClient
{
  Task<PncpPage> ConsultarContratacoesAbertasAsync(
    DateOnly dataFinal,
    string? uf,
    int pagina,
    int tamanhoPagina,
    CancellationToken cancellationToken
  );
}
