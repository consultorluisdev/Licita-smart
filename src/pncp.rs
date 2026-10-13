use crate::models::Licitacao;
use chrono::{Duration, Local};
use serde_json::Value;

const BASE_URL: &str = "https://pncp.gov.br/api/consulta/v1";

pub async fn buscar_propostas(
    client: &reqwest::Client,
    uf: Option<&str>,
    pagina: u32,
    tamanho_pagina: u32,
) -> anyhow::Result<Vec<Value>> {
    let data_final = (Local::now() + Duration::days(60))
        .format("%Y-%m-%d")
        .to_string();

    let tamanho = tamanho_pagina.clamp(1, 50);

    let mut req = client
        .get(format!("{BASE_URL}/contratacoes/propostas"))
        .query(&[
            ("dataFinal", data_final.as_str()),
            ("pagina", pagina.to_string().as_str()),
            ("tamanhoPagina", tamanho.to_string().as_str()),
        ]);

    if let Some(uf) = uf {
        req = req.query(&[("uf", uf)]);
    }

    let response = req.send().await?;

    if response.status() == reqwest::StatusCode::NO_CONTENT {
        return Ok(vec![]);
    }

    let response = response.error_for_status()?;
    let body: Value = response.json().await?;

    let data = body.get("data").cloned().unwrap_or(body);

    let propostas = match data {
        Value::Array(items) => items,
        Value::Object(map) => map
            .get("propostas")
            .and_then(Value::as_array)
            .cloned()
            .unwrap_or_default(),
        _ => vec![],
    };

    Ok(propostas)
}

pub fn mapear_licitacao(item: &Value) -> Licitacao {
    let orgao = item.get("orgaoEntidade").cloned().unwrap_or(Value::Null);
    let unidade = item.get("unidadeOrgao").cloned().unwrap_or(Value::Null);

    let cnpj = orgao
        .get("cnpj")
        .and_then(Value::as_str)
        .unwrap_or("")
        .to_string();

    let ano = item
        .get("anoCompra")
        .and_then(Value::as_str)
        .map(str::to_string)
        .or_else(|| item.get("ano").and_then(Value::as_str).map(str::to_string));

    let sequencial = item
        .get("sequencialCompras")
        .and_then(Value::as_str)
        .map(str::to_string)
        .or_else(|| {
            item.get("sequencial")
                .and_then(Value::as_str)
                .map(str::to_string)
        });

    let link = match (&cnpj, &ano, &sequencial) {
        (cnpj, Some(ano), Some(sequencial)) if !cnpj.is_empty() => {
            format!("https://pncp.gov.br/app/editais/{cnpj}/{ano}/{sequencial}")
        }
        _ => String::new(),
    };

    let id = format!(
        "{}-{}-{}",
        cnpj,
        ano.clone().unwrap_or_else(|| "0".to_string()),
        sequencial.clone().unwrap_or_else(|| "0".to_string())
    );

    let objeto = item
        .get("objetoCompra")
        .or_else(|| item.get("objeto"))
        .and_then(Value::as_str)
        .unwrap_or("Sem objeto")
        .to_string();

    let nome_orgao = orgao
        .get("razaoSocial")
        .and_then(Value::as_str)
        .or_else(|| orgao.get("nomeOrgao").and_then(Value::as_str))
        .unwrap_or("Órgão não informado")
        .to_string();

    let uf = unidade
        .get("uf")
        .and_then(Value::as_str)
        .map(str::to_string)
        .or_else(|| orgao.get("uf").and_then(Value::as_str).map(str::to_string));

    let municipio = unidade
        .get("municipio")
        .and_then(Value::as_str)
        .map(str::to_string)
        .or_else(|| {
            orgao
                .get("municipio")
                .and_then(Value::as_str)
                .map(str::to_string)
        });

    let modalidade = item
        .get("modalidade")
        .and_then(Value::as_str)
        .map(str::to_string)
        .or_else(|| {
            item.get("modalidadeCompra")
                .and_then(Value::as_str)
                .map(str::to_string)
        });

    Licitacao {
        id,
        objeto,
        orgao: nome_orgao,
        uf,
        municipio,
        valor_estimado: item
            .get("valorEstimado")
            .or_else(|| item.get("valor"))
            .and_then(Value::as_f64),
        modalidade,
        data_publicacao: item
            .get("dataPublicacao")
            .or_else(|| item.get("data"))
            .and_then(Value::as_str)
            .map(str::to_string),
        data_limite: item
            .get("dataLimite")
            .or_else(|| item.get("dataFinal"))
            .and_then(Value::as_str)
            .map(str::to_string),
        link_pncp: link,
        cnpj_orgao: if cnpj.is_empty() { None } else { Some(cnpj) },
    }
}
