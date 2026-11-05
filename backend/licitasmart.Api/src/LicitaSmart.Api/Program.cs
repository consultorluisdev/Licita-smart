using LicitaSmart.Api.Data;
using LicitaSmart.Api.Features.Licitacoes;
using LicitaSmart.Api.Integrations.Pncp;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
?? throw new InvalidOperationException(
    "ConnectionString:DefaultConnection não foi configurada."
);

builder.Services.AddDbContext<AppDbContext>(options =>
options.UseNpgsql(connectionString));

builder.Services.AddScoped<LicitacaoService>();

// configuracao PNCP
builder.Services.Configure<PncpOptions>(
    builder.Configuration.GetSection("Pncp"));

// client HTTP PNCP
builder.Services.AddHttpClient<IPncpClient, PncpClient>((ServiceProvider, client) =>
{
    var options = ServiceProvider.GetRequiredService<IOptions<PncpOptions>>().Value;

    client.BaseAddress = new Uri(options.BaseUrl);
    client.Timeout = TimeSpan.FromSeconds(60);

    client.DefaultRequestHeaders.Accept.ParseAdd("application/json");

    client.DefaultRequestHeaders.UserAgent.ParseAdd(
        "LicitaSmart/1.0");
})
.AddStandardHedgingHandler();

builder.Services.AddHostedService<PncpSynchronizer>();

// sincronização automatica
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin();
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

app.MapGet("/health", () => Results.Ok(new
{
    status = "ok"
}))
.WithName("HealthCheck")
.WithSummary("Verifica a disponibilidade da API")
.Produces(StatusCodes.Status200OK);

app.MapControllers();

// mantem a criacao do banco que ja existia
// nao executa mais o seed de licitações ficticias
using(var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
}

app.Run();
