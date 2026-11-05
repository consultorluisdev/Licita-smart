using System.Globalization;
using System.Text.Json;

namespace LicitaSmart.Api.Integrations.Pncp;

public sealed class PncpClient : IPncpClient
{
  private readonly HttpClient _httpClient;
  private readonly ILogger<PncpClient> _logger;

  public PncpClient(
      HttpClient httpClient,
      ILogger<PncpClient> logger)
  {
    _httpClient = httpClient;
    _logger = logger;
  }

  public async Task<PncpPage> ConsultarContratacoesAbertasAsync(
      DateOnly dataFinal,
      string? uf,
      int pagina,
      int tamanhoPagina,
      CancellationToken cancellationToken)
  {
    var parametros = new List<string>
        {
            $"dataFinal={dataFinal:yyyyMMdd}",
            $"pagina={pagina}",
            $"tamanhoPagina={tamanhoPagina}"
        };

    if (!string.IsNullOrWhiteSpace(uf))
    {
      parametros.Add($"uf={Uri.EscapeDataString(uf)}");
    }

    var endpoint =
        "v1/contratacoes/proposta?" +
        string.Join("&", parametros);

    _logger.LogInformation(
        "Consultando PNCP. Página: {Pagina}, UF: {UF}",
        pagina,
        uf);

    using var response = await _httpClient.GetAsync(
        endpoint,
        cancellationToken);

    response.EnsureSuccessStatusCode();

    await using var stream =
        await response.Content.ReadAsStreamAsync(
            cancellationToken);

    using var document = await JsonDocument.ParseAsync(
        stream,
        cancellationToken: cancellationToken);

    var root = document.RootElement;

    var data = GetProperty(root, "data")
               ?? GetProperty(root, "resultados");

    if (data is null ||
        data.Value.ValueKind != JsonValueKind.Array)
    {
      throw new InvalidOperationException(
          "O PNCP retornou uma resposta sem a lista de contratações esperada.");
    }

    var contratacoes = data.Value
        .EnumerateArray()
        .Select(MapearContratacao)
        .ToList();

    var totalPaginas = GetInt(
        root,
        "totalPaginas",
        "totalPages");

    return new PncpPage(
        contratacoes,
        totalPaginas);
  }

  private static PncpContratacao MapearContratacao(
      JsonElement item)
  {
    return new PncpContratacao
    {
      NumeroControlePNCP = GetString(
            item,
            "numeroControlePNCP"),

      Cnpj = GetString(
            item,
            "orgaoEntidade",
            "cnpj")
            ?? GetString(item, "cnpj"),

      RazaoSocial = GetString(
            item,
            "orgaoEntidade",
            "razaoSocial"),

      NomeFantasia = GetString(
            item,
            "orgaoEntidade",
            "nomeFantasia"),

      UF = GetString(
            item,
            "unidadeOrgao",
            "ufSigla")
            ?? GetString(item, "uf"),

      Municipio = GetString(
            item,
            "unidadeOrgao",
            "municipioNome")
            ?? GetString(item, "municipioNome"),

      ObjetoCompra = GetString(
            item,
            "objetoCompra"),

      ModalidadeNome = GetString(
            item,
            "modalidadeNome"),

      Situacao = GetString(
            item,
            "situacaoCompraNome"),

      ValorEstimado = GetDecimal(
            item,
            "valorTotalEstimado"),

      DataPublicacao = GetDate(
            item,
            "dataPublicacaoPncp"),

      DataEncerramentoProposta = GetDate(
            item,
            "dataEncerramentoProposta"),

      NumeroCompra = GetString(
            item,
            "numeroCompra"),

      AnoCompra = GetInt(
            item,
            "anoCompra"),

      SequencialCompra = GetInt(
            item,
            "sequencialCompra"),

      SRP = GetBool(
            item,
            "srp"),

      LinkSistemaOrigem = GetString(
            item,
            "linkSistemaOrigem")
    };
  }

  private static JsonElement? GetProperty(
      JsonElement element,
      string name)
  {
    if (element.ValueKind != JsonValueKind.Object)
      return null;

    foreach (var property in element.EnumerateObject())
    {
      if (string.Equals(
          property.Name,
          name,
          StringComparison.OrdinalIgnoreCase))
      {
        return property.Value;
      }
    }

    return null;
  }

  private static string? GetString(
      JsonElement element,
      params string[] path)
  {
    JsonElement current = element;

    foreach (var name in path)
    {
      var property = GetProperty(current, name);

      if (property is null)
        return null;

      current = property.Value;
    }

    if (current.ValueKind == JsonValueKind.Null ||
        current.ValueKind == JsonValueKind.Undefined)
    {
      return null;
    }

    return current.ValueKind == JsonValueKind.String
        ? current.GetString()
        : current.ToString();
  }

  private static int GetInt(
      JsonElement element,
      params string[] path)
  {
    var value = GetString(element, path);

    return int.TryParse(value, out var result)
        ? result
        : 0;
  }

  private static decimal? GetDecimal(
      JsonElement element,
      params string[] path)
  {
    var value = GetString(element, path);

    if (decimal.TryParse(
        value,
        NumberStyles.Any,
        CultureInfo.InvariantCulture,
        out var result))
    {
      return result;
    }

    return null;
  }

  private static DateTime? GetDate(
      JsonElement element,
      params string[] path)
  {
    var value = GetString(element, path);

    if (DateTimeOffset.TryParse(
        value,
        CultureInfo.InvariantCulture,
        DateTimeStyles.AssumeUniversal,
        out var result))
    {
      return result.UtcDateTime;
    }

    return null;
  }

  private static bool GetBool(
      JsonElement element,
      params string[] path)
  {
    var value = GetString(element, path);

    return bool.TryParse(value, out var result)
        && result;
  }
}
