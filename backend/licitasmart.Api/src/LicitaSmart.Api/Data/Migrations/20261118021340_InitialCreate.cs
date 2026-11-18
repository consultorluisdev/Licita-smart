using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LicitaSmart.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "orgaos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Cnpj = table.Column<string>(type: "character varying(14)", maxLength: 14, nullable: false),
                    RazaoSocial = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    NomeFantasia = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    UF = table.Column<string>(type: "character varying(2)", maxLength: 2, nullable: false),
                    Municipio = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_orgaos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "usuarios",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Nome = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_usuarios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "licitacoes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PncpId = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    OrgaoId = table.Column<Guid>(type: "uuid", nullable: false),
                    Objeto = table.Column<string>(type: "text", nullable: false),
                    UF = table.Column<string>(type: "character varying(2)", maxLength: 2, nullable: false),
                    Municipio = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Modalidade = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Situacao = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ValorEstimado = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    DataPublicacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DataLimite = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    NumeroProcesso = table.Column<string>(type: "text", nullable: true),
                    LinkPncp = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    SRP = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_licitacoes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_licitacoes_orgaos_OrgaoId",
                        column: x => x.OrgaoId,
                        principalTable: "orgaos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "favoritos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UsuarioId = table.Column<Guid>(type: "uuid", nullable: false),
                    LicitacaoId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_favoritos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_favoritos_licitacoes_LicitacaoId",
                        column: x => x.LicitacaoId,
                        principalTable: "licitacoes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_favoritos_usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_favoritos_LicitacaoId",
                table: "favoritos",
                column: "LicitacaoId");

            migrationBuilder.CreateIndex(
                name: "IX_favoritos_UsuarioId_LicitacaoId",
                table: "favoritos",
                columns: new[] { "UsuarioId", "LicitacaoId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_licitacoes_DataPublicacao",
                table: "licitacoes",
                column: "DataPublicacao");

            migrationBuilder.CreateIndex(
                name: "IX_licitacoes_Municipio",
                table: "licitacoes",
                column: "Municipio");

            migrationBuilder.CreateIndex(
                name: "IX_licitacoes_OrgaoId",
                table: "licitacoes",
                column: "OrgaoId");

            migrationBuilder.CreateIndex(
                name: "IX_licitacoes_PncpId",
                table: "licitacoes",
                column: "PncpId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_licitacoes_UF",
                table: "licitacoes",
                column: "UF");

            migrationBuilder.CreateIndex(
                name: "IX_orgaos_Cnpj",
                table: "orgaos",
                column: "Cnpj",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_usuarios_Email",
                table: "usuarios",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "favoritos");

            migrationBuilder.DropTable(
                name: "licitacoes");

            migrationBuilder.DropTable(
                name: "usuarios");

            migrationBuilder.DropTable(
                name: "orgaos");
        }
    }
}
