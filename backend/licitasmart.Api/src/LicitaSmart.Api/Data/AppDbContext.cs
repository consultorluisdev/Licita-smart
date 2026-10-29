using LicitaSmart.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LicitaSmart.Api.Data;

public class AppDbContext : DbContext
{
  public AppDbContext(DbContextOptions<AppDbContext> options)
      : base(options)
  {
  }

  public DbSet<Licitacao> Licitacoes => Set<Licitacao>();

  public DbSet<Orgao> Orgaos => Set<Orgao>();

  public DbSet<Usuario> Usuarios => Set<Usuario>();

  public DbSet<Favorito> Favoritos => Set<Favorito>();

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    base.OnModelCreating(modelBuilder);

    modelBuilder.Entity<Orgao>(entity =>
    {
      entity.ToTable("orgaos");

      entity.HasKey(x => x.Id);

      entity.Property(x => x.Cnpj)
              .HasMaxLength(14)
              .IsRequired();

      entity.Property(x => x.RazaoSocial)
              .HasMaxLength(255)
              .IsRequired();

      entity.Property(x => x.NomeFantasia)
              .HasMaxLength(255);

      entity.Property(x => x.UF)
              .HasMaxLength(2)
              .IsRequired();

      entity.Property(x => x.Municipio)
              .HasMaxLength(150)
              .IsRequired();

      entity.HasIndex(x => x.Cnpj)
              .IsUnique();
    });

    modelBuilder.Entity<Licitacao>(entity =>
    {
      entity.ToTable("licitacoes");

      entity.HasKey(x => x.Id);

      entity.Property(x => x.PncpId)
              .HasMaxLength(150)
              .IsRequired();

      entity.Property(x => x.Objeto)
              .IsRequired();

      entity.Property(x => x.UF)
              .HasMaxLength(2)
              .IsRequired();

      entity.Property(x => x.Municipio)
              .HasMaxLength(150)
              .IsRequired();

      entity.Property(x => x.Modalidade)
              .HasMaxLength(100);

      entity.Property(x => x.Situacao)
              .HasMaxLength(100);

      entity.Property(x => x.ValorEstimado)
              .HasPrecision(18, 2);

      entity.Property(x => x.LinkPncp)
              .HasMaxLength(1000)
              .IsRequired();

      entity.HasIndex(x => x.PncpId)
              .IsUnique();

      entity.HasIndex(x => x.UF);

      entity.HasIndex(x => x.Municipio);

      entity.HasIndex(x => x.DataPublicacao);

      entity.HasOne(x => x.Orgao)
              .WithMany(x => x.Licitacoes)
              .HasForeignKey(x => x.OrgaoId)
              .OnDelete(DeleteBehavior.Restrict);
    });

    modelBuilder.Entity<Usuario>(entity =>
    {
      entity.ToTable("usuarios");

      entity.HasKey(x => x.Id);

      entity.Property(x => x.Nome)
              .HasMaxLength(150)
              .IsRequired();

      entity.Property(x => x.Email)
              .HasMaxLength(255)
              .IsRequired();

      entity.Property(x => x.PasswordHash)
              .IsRequired();

      entity.HasIndex(x => x.Email)
              .IsUnique();
    });

    modelBuilder.Entity<Favorito>(entity =>
    {
      entity.ToTable("favoritos");

      entity.HasKey(x => x.Id);

      entity.HasOne(x => x.Usuario)
              .WithMany(x => x.Favoritos)
              .HasForeignKey(x => x.UsuarioId)
              .OnDelete(DeleteBehavior.Cascade);

      entity.HasOne(x => x.Licitacao)
              .WithMany(x => x.Favoritos)
              .HasForeignKey(x => x.LicitacaoId)
              .OnDelete(DeleteBehavior.Cascade);

      entity.HasIndex(x => new
      {
        x.UsuarioId,
        x.LicitacaoId
      })
          .IsUnique();
    });
  }
}
