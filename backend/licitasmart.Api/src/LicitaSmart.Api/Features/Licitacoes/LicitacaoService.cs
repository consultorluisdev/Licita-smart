using LicitaSmart.Api.Data;
using LicitaSmart.Api.Domain.Entities;
using LicitaSmart.Api.Features.Licitacoes.Dtos;
using Microsoft.EntityFrameworkCore;

namespace LicitaSmart.Api.Features.Licitacoes;

public class LicitacaoService
{
  private readonly AppDbContext _db;

  public LicitacaoService(AppDbContext db)
  {
    _db = db;
  }

  public async Task<object> BuscarAsync(
      LicitacaoQuery query,
      CancellationToken cancellationToken)
  {
    var consulta = _db.Licitacoes
        .AsNoTracking()
        .Include(x => x.Orgao)
        .AsQueryable();

    if (!string.IsNullOrWhiteSpace(query.UF))
    {
      consulta = consulta.Where(x =>
          x.UF == query.UF.ToUpper());
    }

    if (!string.IsNullOrWhiteSpace(query.Municipio))
    {
      var municipio = query.Municipio.Trim();

      consulta = consulta.Where(x =>
          x.Municipio.Contains(municipio));
    }

    if (!string.IsNullOrWhiteSpace(query.Orgao))
    {
      var orgao = query.Orgao.Trim();

      consulta = consulta.Where(x =>
          x.Orgao.RazaoSocial.Contains(orgao));
    }

    if (!string.IsNullOrWhiteSpace(query.Modalidade))
    {
      consulta = consulta.Where(x =>
          x.Modalidade == query.Modalidade);
    }

    if (!string.IsNullOrWhiteSpace(query.Situacao))
    {
      consulta = consulta.Where(x =>
          x.Situacao == query.Situacao);
    }

    var total = await consulta.CountAsync(cancellationToken);

    var page = Math.Max(query.Page, 1);

    var pageSize = Math.Clamp(
        query.PageSize,
        1,
        100);

    var resultados = await consulta
        .OrderByDescending(x => x.DataPublicacao)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(x => new
        {
          x.Id,
          x.PncpId,
          x.Objeto,
          x.UF,
          x.Municipio,
          x.Modalidade,
          x.Situacao,
          x.ValorEstimado,
          x.DataPublicacao,
          x.DataLimite,
          x.NumeroProcesso,
          x.LinkPncp,
          x.SRP,
          Orgao = new
          {
            x.Orgao.Id,
            x.Orgao.Cnpj,
            x.Orgao.RazaoSocial,
            x.Orgao.NomeFantasia,
            x.Orgao.UF,
            x.Orgao.Municipio
          }
        })
        .ToListAsync(cancellationToken);

    return new
    {
      total,
      page,
      pageSize,
      totalPages = (int)Math.Ceiling(
            total / (double)pageSize),
      hasNextPage = page * pageSize < total,
      resultados
    };
  }

  public async Task<object?> ObterPorIdAsync(
      Guid id,
      CancellationToken cancellationToken)
  {
    return await _db.Licitacoes
        .AsNoTracking()
        .Include(x => x.Orgao)
        .Where(x => x.Id == id)
        .Select(x => new
        {
          x.Id,
          x.PncpId,
          x.Objeto,
          x.UF,
          x.Municipio,
          x.Modalidade,
          x.Situacao,
          x.ValorEstimado,
          x.DataPublicacao,
          x.DataLimite,
          x.NumeroProcesso,
          x.LinkPncp,
          x.SRP,
          Orgao = new
          {
            x.Orgao.Id,
            x.Orgao.Cnpj,
            x.Orgao.RazaoSocial,
            x.Orgao.NomeFantasia,
            x.Orgao.UF,
            x.Orgao.Municipio
          }
        })
        .FirstOrDefaultAsync(
            cancellationToken);
  }
}
