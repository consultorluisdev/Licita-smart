# 🚀 Licita Smart

Plataforma de inteligência para pesquisa, descoberta e análise de oportunidades em licitações públicas brasileiras.

O **Licita Smart** tem como objetivo transformar a pesquisa tradicional de licitações em um fluxo mais inteligente:

> **DESCUBRIR → FILTRAR → ANALISAR → QUALIFICAR → SALVAR → MONITORAR → DECIDIR → AGIR**

O projeto combina uma interface web moderna com uma API em Rust, integração com dados públicos do **PNCP** e um AI Agent capaz de interpretar consultas em linguagem natural.

---

## 🎯 Objetivo

O Licita Smart nasceu inicialmente focado em oportunidades de **TI, SaaS e desenvolvimento de sistemas**, mas a arquitetura está sendo preparada para evoluir para diferentes categorias de contratação pública.

### Categorias planejadas

- 💻 Tecnologia / TI
- ☁️ SaaS / Cloud
- 🏥 Saúde
- 🏗️ Obras e Engenharia
- 🍽️ Alimentação
- 🚛 Transporte
- 🛠️ Serviços
- 📦 Materiais
- 🔐 Segurança
- 🎓 Educação
- 🌱 Meio Ambiente
- 📋 Outros

---

# 🏗️ Arquitetura

Atualmente o projeto está dividido em:

```text
Licita-smart/
│
├── backend/
│   └── licita-api/
│       ├── src/
│       │   ├── agent.rs
│       │   ├── config.rs
│       │   ├── db.rs
│       │   ├── error.rs
│       │   ├── filters.rs
│       │   ├── main.rs
│       │   ├── models.rs
│       │   ├── pncp.rs
│       │   └── routes.rs
│       │
│       ├── Cargo.toml
│       └── Cargo.lock
│
├── frontend/
│   └── licita-ti/
│       ├── src/
│       │   ├── components/
│       │   ├── layouts/
│       │   ├── pages/
│       │   ├── services/
│       │   ├── hooks/
│       │   ├── types/
│       │   ├── utils/
│       │   ├── api.ts
│       │   └── App.tsx
│       │
│       ├── package.json
│       └── vite.config.ts
│
├── .env
├── README.md
└── STATUS-E-PROXIMOS-PASSOS.md
```

---

# ⚙️ Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide React
- React Router
- Axios

## Backend

- Rust
- Axum
- Tokio
- Reqwest
- Serde
- SQLx
- SQLite atualmente
- Tracing

## Dados

- PNCP — Portal Nacional de Contratações Públicas

## Futuro

- PostgreSQL
- Rust AI Agents
- Rig
- autenticação
- cache
- processamento assíncrono
- regras de negócio
- matching entre empresa e oportunidades

---

# 🦀 Backend

A API está sendo construída em **Rust + Axum**.

O objetivo é manter uma API rápida, tipada e preparada para receber posteriormente regras de negócio mais complexas e agentes de IA.

## Executar

Entre no backend:

```bash
cd backend/licita-api
```

Execute:

```bash
cargo run
```

Por padrão, a API utiliza a porta configurada no ambiente.

Exemplo:

```text
http://localhost:8080
```

---

# 🔌 Endpoints atuais

## Health Check

```http
GET /health
```

Resposta:

```json
{
  "status": "ok"
}
```

---

## Listar licitações

```http
GET /licitacoes
```

Exemplo:

```http
GET /licitacoes?uf=SC&apenas_ti=true&pagina=1&tamanho=50
```

Resposta atual:

```json
{
  "total": 10,
  "pagina": 1,
  "tamanho": 50,
  "tem_proxima_pagina": false,
  "resultados": []
}
```

### Parâmetros

| Parâmetro | Descrição |
|---|---|
| `uf` | Estado da licitação |
| `apenas_ti` | Filtra oportunidades de TI/SaaS |
| `pagina` | Página atual |
| `tamanho` | Quantidade de resultados |

---

# 🤖 AI Agent

O Licita Smart possui um endpoint inicial para interação em linguagem natural.

```http
POST /chat
```

Body:

```json
{
  "message": "SaaS em SC"
}
```

Resposta:

```json
{
  "resposta": "Encontrei oportunidades...",
  "licitacoes": []
}
```

O agente atualmente consegue interpretar alguns parâmetros básicos, principalmente:

- UF
- Santa Catarina
- São Paulo
- Rio de Janeiro
- Paraná
- Rio Grande do Sul
- Minas Gerais
- Bahia
- Pernambuco
- Ceará
- Distrito Federal
- filtro de TI/SaaS
- busca sem filtro

---

# 🧠 Evolução do Agent

O Agent será evoluído gradualmente.

### V1 — Atual

```text
Mensagem
   ↓
Interpretador
   ↓
UF
   ↓
Filtro TI/SaaS
   ↓
PNCP
```

### V2 — Próxima evolução

O agente deverá interpretar:

```text
categoria
UF
município
palavras-chave
valor mínimo
valor máximo
modalidade
situação
prazo
```

Exemplos:

```text
"Encontre SaaS em Santa Catarina"

"Procure TI em Brusque"

"Licitações de software acima de 100 mil"

"Oportunidades de tecnologia no Paraná"

"Todas as licitações de saúde em SC"
```

### V3 — Inteligência

Posteriormente:

```text
Empresa
   ↓
Perfil da empresa
   ↓
Agent
   ↓
Matching
   ↓
Licitações compatíveis
   ↓
Opportunity Score
   ↓
Recomendação
```

---

# 🔎 Opportunity Score

O projeto pretende utilizar um **Opportunity Score** para ajudar a priorizar oportunidades.

O score poderá considerar fatores como:

- compatibilidade com o negócio
- localização
- valor estimado
- prazo
- concorrência
- histórico
- categoria
- aderência ao perfil da empresa

> ⚠️ O Opportunity Score é uma ferramenta de apoio à decisão. Não representa parecer jurídico, garantia de vitória ou autoridade sobre uma licitação.

---

# 🌐 Frontend

Entre no frontend:

```bash
cd frontend/licita-ti
```

Instale as dependências:

```bash
npm install
```

Execute:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

---

# 🔗 Configuração da API

O frontend utiliza uma camada Axios centralizada.

Arquivo:

```text
src/api.ts
```

A URL pode ser configurada através de:

```env
VITE_API_URL=http://localhost:8080
```

Sem configuração, o frontend utiliza:

```text
http://localhost:8080
```

---

# 🖥️ Principais áreas do sistema

A plataforma está sendo estruturada para possuir:

- Dashboard
- AI Agent
- Licitações
- Oportunidades
- Pesquisa
- Monitoramento
- Alertas
- Órgãos
- Fornecedores
- Favoritos
- Análises
- Agenda
- Relatórios
- Integrações
- Configurações

---

# 📊 Fluxo principal

```text
┌───────────────┐
│   DISCOVER    │
└───────┬───────┘
        ↓
┌───────────────┐
│    FILTER     │
└───────┬───────┘
        ↓
┌───────────────┐
│    ANALYZE    │
└───────┬───────┘
        ↓
┌───────────────┐
│   QUALIFY     │
└───────┬───────┘
        ↓
┌───────────────┐
│     SAVE      │
└───────┬───────┘
        ↓
┌───────────────┐
│   MONITOR     │
└───────┬───────┘
        ↓
┌───────────────┐
│    DECIDE     │
└───────┬───────┘
        ↓
┌───────────────┐
│     ACT       │
└───────────────┘
```

---

# 🛡️ Segurança

O frontend **não deve armazenar secrets ou API keys**.

Responsabilidades do backend:

- integração com PNCP
- autenticação
- autorização
- validação
- regras de negócio
- integração com serviços externos
- processamento de dados
- agentes de IA

---

# 🚧 Próximas melhorias da API

Prioridades atuais:

### API

- [ ] Melhorar tratamento de erros
- [ ] Tratamento específico de HTTP 429
- [ ] Retry/backoff controlado
- [ ] Cache de consultas PNCP
- [ ] Melhorar paginação
- [ ] Melhorar filtros
- [ ] Padronizar respostas
- [ ] Logs estruturados
- [ ] Validação dos parâmetros
- [ ] Testes da API

### Agent

- [ ] Melhor interpretação de linguagem natural
- [ ] Categoria
- [ ] Município
- [ ] Valor
- [ ] Modalidade
- [ ] Prazo
- [ ] Palavras-chave
- [ ] Histórico de conversas
- [ ] Matching empresa × licitação
- [ ] Opportunity Score
- [ ] Integração com agente de IA/Rig

### Frontend

- [ ] Finalizar Dashboard
- [ ] Finalizar tela de Licitações
- [ ] Conectar AI Agent
- [ ] Estados de loading
- [ ] Estados de erro
- [ ] Estados vazios
- [ ] Paginação
- [ ] Filtros avançados
- [ ] Detalhes da licitação
- [ ] Monitoramento
- [ ] Alertas

---

# 🗺️ Roadmap

## Fase 1 — MVP

```text
React
  +
Rust/Axum
  +
PNCP
  +
AI Agent básico
```

Status: 🟡 Em desenvolvimento

---

## Fase 2 — Inteligência

```text
PNCP
 ↓
Ingestão
 ↓
Normalização
 ↓
Filtros
 ↓
Agent
 ↓
Opportunity Score
```

Status: ⏳ Planejado

---

## Fase 3 — Plataforma

```text
Empresa
   ↓
Perfil
   ↓
Matching
   ↓
Oportunidades
   ↓
Monitoramento
   ↓
Alertas
   ↓
Análises
```

Status: ⏳ Planejado

---

## Fase 4 — Produto

- autenticação
- planos
- empresas
- usuários
- assinatura
- dashboards personalizados
- alertas automáticos
- relatórios
- integrações
- infraestrutura cloud

Status: ⏳ Futuro

---

# 🧪 Qualidade

Antes de subir alterações:

### Frontend

```bash
npm run lint
npm run build
```

### Backend

```bash
cargo check
cargo test
```

O objetivo é manter o projeto com código tipado, testável e preparado para evolução.

---

# 📌 Princípios do projeto

1. **Não criar complexidade antes da necessidade.**
2. **Backend responsável pelas regras e integrações.**
3. **Frontend responsável pela experiência do usuário.**
4. **IA como apoio à decisão, não como autoridade jurídica.**
5. **Dados públicos devem ser tratados e apresentados com transparência.**
6. **Código fortemente tipado.**
7. **Módulos independentes e substituíveis.**
8. **Mocks devem permanecer isolados quando utilizados.**
9. **Nenhum segredo no frontend.**
10. **Evoluir o MVP sem abandonar o que já funciona.**

---

# 📄 Status atual

O Licita Smart já possui:

- ✅ Frontend React + TypeScript
- ✅ Dashboard inicial
- ✅ Tela de Licitações
- ✅ AI Agent
- ✅ API Rust + Axum
- ✅ Endpoint `/health`
- ✅ Endpoint `/licitacoes`
- ✅ Endpoint `/chat`
- ✅ Integração inicial com PNCP
- ✅ Axios centralizado
- ✅ Estrutura de services/hooks/types
- ✅ Filtro inicial de TI/SaaS
- 🔄 Evolução da API
- 🔄 Integração completa do Agent
- 🔄 Evolução da inteligência
- 🔄 Cache e robustez do PNCP

---

# 🚀 Visão

O objetivo final é transformar o Licita Smart em uma plataforma de **inteligência de contratações públicas**, capaz de ajudar empresas a encontrar oportunidades relevantes, entender os editais, acompanhar prazos e tomar decisões melhores.

Não é apenas um buscador de licitações.

É uma camada de inteligência entre:

```text
Dados públicos
      ↓
Licita Smart
      ↓
Inteligência
      ↓
Empresa
      ↓
Decisão
```

---

## 👨‍💻 Desenvolvimento

Projeto desenvolvido com foco em:

**Rust + React + TypeScript + Dados Públicos + Inteligência Artificial**

Status: 🚧 Em desenvolvimento ativo.
