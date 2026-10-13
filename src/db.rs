use crate::models::Licitacao;
use sqlx::{sqlite::SqlitePoolOptions, SqlitePool};

pub async fn connect(database_url: &str) -> anyhow::Result<SqlitePool> {
    if database_url.starts_with("sqlite:") {
        let path = database_url.trim_start_matches("sqlite:");
        if path != ":memory:" {
            let _ = std::fs::OpenOptions::new()
                .create(true)
                .write(true)
                .open(path);
        }
    }

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(database_url)
        .await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS licitacoes (
            id TEXT PRIMARY KEY,
            objeto TEXT NOT NULL,
            orgao TEXT NOT NULL,
            uf TEXT,
            municipio TEXT,
            valor_estimado REAL,
            modalidade TEXT,
            data_publicacao TEXT,
            data_limite TEXT,
            link_pncp TEXT NOT NULL,
            cnpj_orgao TEXT,
            primeira_vez_visto TEXT DEFAULT (datetime('now')),
            visualizado INTEGER DEFAULT 0
        )
        "#,
    )
    .execute(&pool)
    .await?;

    Ok(pool)
}

pub async fn salvar_licitacao(pool: &SqlitePool, licitacao: &Licitacao) -> anyhow::Result<()> {
    sqlx::query(
        r#"
        INSERT OR REPLACE INTO licitacoes (
            id, objeto, orgao, uf, municipio, valor_estimado, modalidade,
            data_publicacao, data_limite, link_pncp, cnpj_orgao
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#,
    )
    .bind(&licitacao.id)
    .bind(&licitacao.objeto)
    .bind(&licitacao.orgao)
    .bind(&licitacao.uf)
    .bind(&licitacao.municipio)
    .bind(licitacao.valor_estimado)
    .bind(&licitacao.modalidade)
    .bind(&licitacao.data_publicacao)
    .bind(&licitacao.data_limite)
    .bind(&licitacao.link_pncp)
    .bind(&licitacao.cnpj_orgao)
    .execute(pool)
    .await?;

    Ok(())
}
