use regex::Regex;
use std::collections::HashMap;

pub fn interpretar_mensagem(message: &str) -> (Option<String>, bool) {
    let texto = message.to_lowercase();

    let mapa = HashMap::from([
        ("sc", "SC"),
        ("santa catarina", "SC"),
        ("sp", "SP"),
        ("sao paulo", "SP"),
        ("são paulo", "SP"),
        ("rj", "RJ"),
        ("rio de janeiro", "RJ"),
        ("pr", "PR"),
        ("parana", "PR"),
        ("paraná", "PR"),
        ("rs", "RS"),
        ("rio grande do sul", "RS"),
        ("mg", "MG"),
        ("minas gerais", "MG"),
        ("ba", "BA"),
        ("pe", "PE"),
        ("pernambuco", "PE"),
        ("ce", "CE"),
        ("ceara", "CE"),
        ("ceará", "CE"),
        ("df", "DF"),
        ("brasilia", "DF"),
        ("brasília", "DF"),
    ]);

    let mut uf = None;

    for (chave, sigla) in &mapa {
        let re = Regex::new(&format!(r"\b{}\b", regex::escape(chave))).unwrap();
        if re.is_match(&texto) {
            uf = Some(sigla.to_string());
            break;
        }
    }

    if texto.contains("brasil todo")
        || texto.contains("todo brasil")
        || texto.contains("todas as ufs")
        || texto.contains("todo o brasil")
    {
        uf = None;
    } else if uf.is_none() {
        uf = Some("SC".to_string());
    }

    let mut apenas_ti = true;
    if texto.contains("sem filtro")
        || texto.contains("todas as licitacoes")
        || texto.contains("todas as licitações")
        || texto.contains("qualquer tipo")
    {
        apenas_ti = false;
    }

    (uf, apenas_ti)
}

pub fn montar_resposta(total: usize, uf: Option<&str>, apenas_ti: bool) -> String {
    let local = uf.unwrap_or("Brasil");
    let tipo = if apenas_ti {
        "de TI/SaaS"
    } else {
        "de todas as licitações"
    };

    if total == 0 {
        return format!(
            "Não encontrei licitações {tipo} em {local} no momento. Tente outra UF ou termo."
        );
    }

    let plural = if total == 1 {
        "licitação"
    } else {
        "licitações"
    };
    format!("Encontrei {total} {plural} {tipo} em {local}. Abaixo estão as oportunidades.")
}
