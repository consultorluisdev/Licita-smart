using LicitaSmart.Api.Data;
using LicitaSmart.Api.Domain.Entities;
using LicitaSmart.Api.Features.Licitacoes;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "ConnectionStrings:DefaultConnection não foi configurada.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddScoped<LicitacaoService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowAnyOrigin();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("Frontend");

app.UseHttpsRedirection();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }))
    .WithName("HealthCheck")
    .WithSummary("Verifica a disponibilidade da API")
    .Produces(StatusCodes.Status200OK);

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider
        .GetRequiredService<AppDbContext>();

    await db.Database.EnsureCreatedAsync();

    await SeedAsync(db);
}

app.Run();

static async Task SeedAsync(AppDbContext db)
{
    if (await db.Licitacoes.AnyAsync())
    {
        return;
    }

    var orgao = new Orgao
    {
        Id = Guid.NewGuid(),
        Cnpj = "00000000000100",
        RazaoSocial = "Prefeitura Municipal de Brusque",
        NomeFantasia = "Prefeitura de Brusque",
        UF = "SC",
        Municipio = "Brusque"
    };

    db.Orgaos.Add(orgao);

    db.Licitacoes.AddRange(
        new Licitacao
        {
            Id = Guid.NewGuid(),
            PncpId = "DEV-001",
            OrgaoId = orgao.Id,
            Objeto = "Contratação de empresa especializada em desenvolvimento de software",
            UF = "SC",
            Municipio = "Brusque",
            Modalidade = "Pregão Eletrônico",
            Situacao = "Aberta",
            ValorEstimado = 150000,
            DataPublicacao = DateTime.UtcNow.AddDays(-2),
            DataLimite = DateTime.UtcNow.AddDays(15),
            NumeroProcesso = "001/2026",
            LinkPncp = "https://pncp.gov.br/",
            SRP = false
        },
        new Licitacao
        {
            Id = Guid.NewGuid(),
            PncpId = "DEV-002",
            OrgaoId = orgao.Id,
            Objeto = "Aquisição de infraestrutura de tecnologia da informação e serviços em nuvem",
            UF = "SC",
            Municipio = "Brusque",
            Modalidade = "Concorrência",
            Situacao = "Aberta",
            ValorEstimado = 320000,
            DataPublicacao = DateTime.UtcNow.AddDays(-1),
            DataLimite = DateTime.UtcNow.AddDays(20),
            NumeroProcesso = "002/2026",
            LinkPncp = "https://pncp.gov.br/",
            SRP = true
        }
    );

    await db.SaveChangesAsync();
}
