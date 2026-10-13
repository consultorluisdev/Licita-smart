const KEYWORDS_TI: &[&str] = &[
    "software",
    "saas",
    "sistema",
    "sistemas",
    "licenca",
    "licença",
    "cloud",
    "infraestrutura de ti",
    "tecnologia da informacao",
    "tecnologia da informação",
    "desenvolvimento de software",
    "solucao de ti",
    "solução de ti",
    "manutencao de sistemas",
    "manutenção de sistemas",
    "aplicativo",
    "plataforma digital",
    "erp",
    "crm",
    "hospedagem",
    "datacenter",
    "seguranca da informacao",
    "segurança da informação",
    "backup",
    "suporte tecnico",
    "suporte técnico",
];

pub fn is_ti_saas(objeto: &str) -> bool {
    let texto = objeto.to_lowercase();
    KEYWORDS_TI.iter().any(|&keyword| texto.contains(keyword))
}
