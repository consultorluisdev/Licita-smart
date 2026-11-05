using System.Text.RegularExpressions;
using LicitaSmart.Api.Data;
using LicitaSmart.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace LicitaSmart.Api.Integrations.Pncp;

public sealed class PncpSynchronizer : BackgroundService
{
  private readonly IServiceScopeFactory _scopeFactory;
  private readonly IPncpClient _pncpClient;
  private readonly PncpOptions _options;
  private readonly ILogger<PncpSynchronizer> _logger;

  public PncpSynchronizer(
      IServiceScopeFactory scopeFactory,
      IPncpClient pncpClient,
      IOptions<PncpOptions> options,
      ILogger<PncpSynchronizer> logger)
  {
    _scopeFactory = scopeFactory;
    _pncpClient = pncpClient;
    _options = options.Value;
    _logger = logger;
  }

  protected override async Task ExecuteAsync(
      CancellationToken stoppingToken)
  {
    if (!_options.Habilitado)
    {
      _logger.LogInformation(
          "Sincronização PNCP desabilitada.");

      return;
    }

    while (!stoppingToken.IsCancellationRequested)
    {
      try
      {
        await SincronizarAsync(stoppingToken);
      }
      catch (OperationCanceledException)
          when (stoppingToken.IsCancellationRequested)
      {
        break;
      }
      catch (Exception ex)
      {
        _logger.LogError(
            ex,
            "Erro durante a sincronização PNCP.");
      }

      try
      {
        await Task.Delay(
            TimeSpan.FromMinutes(
                Math.Max(1, _options.IntervaloMinutos)),
            stoppingToken);
      }
      catch (OperationCanceledException)
          when (stoppingToken.IsCancellationRequested)
      {
        break;
      }
    }
  }

  private async Task SincronizarAsync(
      CancellationToken cancellationToken)
  {
    var dataFinal = DateOnly.FromDateTime(
        DateTime.UtcNow.AddDays(_options.DiasHorizonte));

    var tamanhoPagina = Math.Clamp(
        _options.TamanhoPagina,
        10,
        100);

    var maxPaginas = Math.Max(
        1,
        _options.MaxPaginasPorExecucao);

    var totalProcessado = 0;

    for (var pagina = 1;
         pagina <= maxPaginas;
         pagina++)
    {
      cancellationToken.ThrowIfCancellationRequested();

      var resultado =
          await _pncpClient.ConsultarContratacoesAbertasAsync(
              dataFinal,
              _options.UF,
              pagina,
              tamanhoPagina,
              cancellationToken);

      if (resultado.Contratacoes.Count == 0)
        break;

      await SalvarContratacoesAsync(
          resultado.Contratacoes,
          cancellationToken);

      totalProcessado += resultado.Contratacoes.Count;

      _logger.LogInformation(
          "PNCP: página {Pagina}, registros recebidos: {Quantidade}",
          pagina,
          resultado.Contratacoes.Count);

      if (resultado.TotalPaginas > 0 &&
          pagina >= resultado.TotalPaginas)
      {
        break;
      }

      if (resultado.Contratacoes.Count < tamanhoPagina)
        break;
    }

    _logger.LogInformation(
        "Sincronização PNCP concluída. Registros processados: {Total}",
        totalProcessado);
  }

  private async Task SalvarContratacoesAsync(
      IReadOnlyList<PncpContratacao> contratacoes,
      CancellationToken cancellationToken)
  {
    using var scope = _scopeFactory.CreateScope();

    var db = scope.ServiceProvider
        .GetRequiredService<AppDbContext>();

    var validas = contratacoes
        .Select(item => new
        {
          Item = item,
          Cnpj = NormalizarCnpj(item.Cnpj),
          PncpId = ObterPncpId(item)
        })
        .Where(x =>
            x.Cnpj.Length == 14 &&
            !string.IsNullOrWhiteSpace(x.PncpId) &&
            !string.IsNullOrWhiteSpace(x.Item.RazaoSocial) &&
            !string.IsNullOrWhiteSpace(x.Item.UF) &&
            !string.IsNullOrWhiteSpace(x.Item.Municipio) &&
            !string.IsNullOrWhiteSpace(x.Item.ObjetoCompra))
        .ToList();

    if (validas.Count == 0)
      return;

    var cnpjs = validas
        .Select(x => x.Cnpj)
        .Distinct()
        .ToList();

    var ids = validas
        .Select(x => x.PncpId)
        .Distinct()
        .ToList();

    var orgaos = await db.Orgaos
        .Where(x => cnpjs.Contains(x.Cnpj))
        .ToDictionaryAsync(
            x => x.Cnpj,
            cancellationToken);

    var licitacoes = await db.Licitacoes
        .Where(x => ids.Contains(x.PncpId))
        .ToDictionaryAsync(
            x => x.PncpId,
            cancellationToken);

    foreach (var registro in validas)
    {
      var item = registro.Item;

      var uf = item.UF!.Trim().ToUpperInvariant();
      var municipio = item.Municipio!.Trim();

      var razaoSocial = item.RazaoSocial!.Trim();

      if (!orgaos.TryGetValue(
          registro.Cnpj,
          out var orgao))
      {
        orgao = new Orgao
        {
          Id = Guid.NewGuid(),
          Cnpj = registro.Cnpj,
          RazaoSocial = razaoSocial,
          NomeFantasia = item.NomeFantasia,
          UF = uf,
          Municipio = municipio
        };

        db.Orgaos.Add(orgao);

        orgaos.Add(registro.Cnpj, orgao);
      }
      else
      {
        orgao.RazaoSocial = razaoSocial;
        orgao.NomeFantasia = item.NomeFantasia;
        orgao.UF = uf;
        orgao.Municipio = municipio;
      }

      var link = ObterLink(item, registro.Cnpj);

      if (!licitacoes.TryGetValue(
          registro.PncpId,
          out var licitacao))
      {
        licitacao = new Licitacao
        {
          Id = Guid.NewGuid(),
          PncpId = registro.PncpId,
          OrgaoId = orgao.Id,
          Orgao = orgao
        };

        db.Licitacoes.Add(licitacao);

        licitacoes.Add(
            registro.PncpId,
            licitacao);
      }

      licitacao.OrgaoId = orgao.Id;
      licitacao.Orgao = orgao;
      licitacao.Objeto = item.ObjetoCompra!.Trim();
      licitacao.UF = uf;
      licitacao.Municipio = municipio;
      licitacao.Modalidade = item.ModalidadeNome;
      licitacao.Situacao =
          string.IsNullOrWhiteSpace(item.Situacao)
              ? "Aberta"
              : item.Situacao;
      licitacao.ValorEstimado = item.ValorEstimado;
      licitacao.DataPublicacao = item.DataPublicacao;
      licitacao.DataLimite = item.DataEncerramentoProposta;
      licitacao.NumeroProcesso = item.NumeroCompra;
      licitacao.LinkPncp = link;
      licitacao.SRP = item.SRP;
      licitacao.UpdatedAt = DateTime.UtcNow;
    }

    await db.SaveChangesAsync(cancellationToken);
  }

  private static string NormalizarCnpj(string? cnpj)
  {
    return Regex.Replace(cnpj ?? "", @"\D", "");
  }

  private static string ObterPncpId(
      PncpContratacao item)
  {
    if (!string.IsNullOrWhiteSpace(
        item.NumeroControlePNCP))
    {
      return item.NumeroControlePNCP.Trim();
    }

    if (!string.IsNullOrWhiteSpace(item.Cnpj) &&
        item.AnoCompra.HasValue &&
        item.SequencialCompra.HasValue)
    {
      return $"{NormalizarCnpj(item.Cnpj)}-" +
             $"{item.AnoCompra}-" +
             $"{item.SequencialCompra}";
    }

    return string.Empty;
  }

  private static string ObterLink(
      PncpContratacao item,
      string cnpj)
  {
    if (Uri.TryCreate(
        item.LinkSistemaOrigem,
        UriKind.Absolute,
        out var link))
    {
      return link.ToString();
    }

    if (item.AnoCompra.HasValue &&
        item.SequencialCompra.HasValue)
    {
      return
          $"https://pncp.gov.br/app/editais/{cnpj}/" +
          $"{item.AnoCompra}/{item.SequencialCompra}";
    }

    return "https://pncp.gov.br/";
  }
}
