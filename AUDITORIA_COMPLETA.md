# Auditoria Completa - Licita-smart

## Visão Geral do Projeto

**Licita-smart** é uma aplicação para monitoramento de licitações públicas do governo brasileiro (PNCP) com foco inicial em TI/SaaS. O projeto é dividido em:
- **Backend**: API Rust (Axum) - `backend/licita-api/`
- **Frontend**: React + TypeScript + Vite + TailwindCSS - `frontend/licita-ti/`

---

## BACKEND (Rust/Axum)

### Estrutura de Arquivos
```
backend/licita-api/
├── Cargo.toml
├── src/
│   ├── main.rs          # Entry point, roteamento, CORS
│   ├── config.rs        # Configuração via env vars
│   ├── db.rs            # SQLite + SQLx (pool, migrations)
│   ├── models.rs        # Structs de dados (Licitacao, BuscaResponse, ChatRequest/Response)
│   ├── routes.rs        # Handlers HTTP (health, listar_licitacoes, chat_agente)
│   ├── pncp.rs          # Integração API PNCP (buscar_propostas, mapear_licitacao)
│   ├── agent.rs         # LLM-lite: interpreta mensagem, extrai UF/filtro, monta resposta
│   ├── filters.rs       # Keywords TI/SaaS para filtrar objetos
│   └── error.rs         # Tratamento de erros unificado (AppError)
```

### Dependências (Cargo.toml)
- **Web**: axum 0.7, tokio, tower-http (CORS)
- **HTTP Client**: reqwest 0.12 (rustls-tls)
- **Serialização**: serde, serde_json
- **DB**: sqlx 0.8 (sqlite, runtime-tokio-rustls, chrono)
- **Utils**: dotenvy, anyhow, thiserror, chrono, tracing, regex

### Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/` | Info da API + endpoints disponíveis |
| GET | `/health` | Health check: `{"status":"ok"}` |
| GET | `/licitacoes` | Lista licitações com paginação e filtros |
| POST | `/chat` | Chat agent: interpreta mensagem, busca e salva no DB |

#### GET /licitacoes - Query Params
- `pagina` (default: 1, min: 1)
- `tamanho` (default: 50, clamp: 10-50)
- `apenas_ti` (default: true) - filtra por keywords TI/SaaS
- `uf` (opcional) - UF em maiúsculas (ex: "SC")

#### POST /chat - Body
```json
{ "message": "string" }
```
- Interpreta mensagem (extrai UF via regex + mapa de sinônimos)
- Busca propostas no PNCP (página 1, tamanho 50)
- Filtra por TI/SaaS (se não pedir "sem filtro")
- Salva cada licitação no SQLite (INSERT OR REPLACE)
- Retorna resposta textual + top 5 licitações

### Integração PNCP (`pncp.rs`)
- **Base URL**: `https://pncp.gov.br/api/consulta/v1`
- **Endpoint**: `/contratacoes/propostas`
- **Query**: `dataFinal` (hoje + 60 dias), `pagina`, `tamanhoPagina` (max 50), `uf` (opcional)
- **Tratamento**: NO_CONTENT → array vazio; response pode vir como array direto ou objeto com chave `propostas`
- **Mapeamento**: Extrai campos do JSON dinâmico (orgaoEntidade, unidadeOrgao, objetoCompra, valorEstimado, etc.)
- **Link PNCP**: Construído com CNPJ + ano + sequencial

### Filtro TI/SaaS (`filters.rs`)
28 keywords hardcoded: software, saas, sistema, licença, cloud, infraestrutura de ti, tecnologia da informação, desenvolvimento de software, solução de ti, manutenção de sistemas, aplicativo, plataforma digital, erp, crm, hospedagem, datacenter, segurança da informação, backup, suporte técnico, etc.

### Agente/Chat (`agent.rs`)
- **interpretar_mensagem**: Regex com word boundaries para detectar UF (mapa 30 entradas: SC, SP, RJ, PR, RS, MG, BA, PE, CE, DF + nomes por extenso)
- Default: UF = "SC" se não especificado e não for "brasil todo"
- **montar_resposta**: Template string com pluralização

### Banco de Dados (`db.rs`)
- **SQLite** via SQLx (pool max 5 conexões)
- **Tabela**: `licitacoes` (id PK, objeto, orgao, uf, municipio, valor_estimado, modalidade, data_publicacao, data_limite, link_pncp, cnpj_orgao, primeira_vez_visto, visualizado)
- **Auto-migration**: CREATE TABLE IF NOT EXISTS na conexão
- **Salvar**: INSERT OR REPLACE (upsert por id)

### Configuração (`config.rs`)
- `DATABASE_URL` (default: `sqlite:licitacoes.db`)
- `PORT` (default: 8080)
- Carrega `.env` via dotenvy

### Tratamento de Erros (`error.rs`)
- `AppError::Anyhow` → 500 + log error
- `AppError::Message(status, msg)` → status customizado
- Implementa `IntoResponse` para Axum
- From para anyhow, sqlx, reqwest

### CORS
- **Atual**: `CorsLayer::new().allow_origin(Any).allow_methods(Any).allow_headers(Any)` - **PERMISSIVO DEMAIS PARA PRODUÇÃO**

---

## FRONTEND (React/TypeScript/Vite)

### Estrutura de Arquivos
```
frontend/licita-ti/
├── package.json
├── vite.config.ts
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── eslint.config.js
├── index.html
├── src/
│   ├── main.tsx           # Bootstrap React
│   ├── App.tsx            # Rotas (BrowserRouter, AllLayout, Dashboard, catch-all redirect)
│   ├── api.ts             # Axios instance + healthCheck
│   ├── types.ts           # Tipos legados (Licitation, Opportunity, Metric)
│   ├── types/dashboard.ts # Tipos da dashboard (DashboardMetric, DashboardOverview)
│   ├── services/
│   │   └── dashboardService.ts  # getDashboard() - fetch + transform + métricas
│   ├── components/
│   │   ├── MetricCard.tsx       # Card de métrica com ícone
│   │   ├── LicitationTable.tsx  # Tabela de licitações
│   │   ├── PageHeader.tsx       # Cabeçalho de página
│   │   └── Badge.tsx            # Badge com tons (success, warning, danger, info, neutral)
│   ├── layouts/
│   │   └── AppLayout.tsx        # Sidebar + Header + Outlet + API status indicator
│   ├── pages/
│   │   └── Dashboard.tsx        # Página principal (métricas, gráficos, tabela)
│   ├── utils/format.ts          # brl(), compactNumber()
│   ├── data.ts                  # Dados mock (não usado atualmente)
│   ├── App.css                  # Estilos globais mínimos
│   └── index.css                # Tailwind v4 + tema dark + utilitários
```

### Dependências (package.json)
- **Runtime**: react 19, react-dom 19, react-router-dom 7, axios 1.20, lucide-react 1.58
- **Dev**: typescript 6, vite 8, @vitejs/plugin-react, tailwindcss 4 + @tailwindcss/vite, eslint 10 + typescript-eslint + react-hooks + react-refresh

### Configuração
- **Vite**: React + TailwindCSS v4 (plugin)
- **TypeScript**: Project references (app + node)
- **ESLint**: Flat config, recommended + TS + React hooks + React refresh
- **Tailwind**: v4 (CSS-first), tema dark customizado (`#07090d` background)

### API Client (`api.ts`)
```typescript
axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  timeout: 15000
})
```
- `healthCheck()` → GET `/health`

### Dashboard Service (`dashboardService.ts`)
- **getDashboard()**: GET `/licitacoes?pagina=1&tamanho=50&apenas_ti=true`
- **Transformação**: BackendLicitacao → Opportunity (categoria via heurística em `categorize()`)
- **Métricas calculadas no frontend**:
  - Licitações recebidas (count)
  - Órgãos únicos (Set)
  - Estados/UFs únicos (Set)
  - Com valor estimado (count)
  - Com prazo informado (count)
  - Valor total estimado (soma + formatação BRL)
- **Gráficos**:
  - `opportunityTrend`: Top 7 valores → barras proporcionais
  - `categoryDistribution`: Contagem por categoria + %

### Componentes Principais

#### AppLayout (`AppLayout.tsx`)
- **Sidebar**: Navegação com 11 rotas (Dashboard, AI Agent, Licitações, Pesquisa, Monitoramento, Alertas, Fornecedores, Favoritos, Análises, Relatórios, Integrações) + Settings
- **Estado**: collapsed, mobileOpen, apiOnline (null/true/false)
- **Health check**: `useEffect` chama `healthCheck()` no mount
- **Header**: Sticky, status "Sistema Operacional", notificações, avatar usuário

#### Dashboard (`Dashboard.tsx`)
- **Estados**: dashboard data, loading, error, retry counter
- **Skeleton**: Loading animado (pulse)
- **Error state**: Botão "Tentar novamente"
- **Layout**: 
  - PageHeader + Badge com count
  - Grid 6 colunas: 6 MetricCards
  - Grid 2 colunas: Maiores valores (barras) + Categorias (barras de progresso)
  - Tabela: LicitationTable (compact)

#### LicitationTable (`LicitationTable.tsx`)
- Colunas: Objeto (com categoria), Órgão, Local (opcional compact), Valor estimado, Prazo, Edital (link PNCP)
- Formatação: BRL, data pt-BR (UTC), "Não informado" para null

---

## PONTOS DE ATENÇÃO / RISCOS / MELHORIAS

### 🔴 Críticos (Bloqueiam Produção)

1. **CORS Permissivo** (`main.rs:36-39`)
   - `allow_origin(Any)` permite qualquer origem
   - **Fix**: Restringir ao domínio Vercel em produção

2. **SQLite em Arquivo Local** (`config.rs:15`, `db.rs:6-12`)
   - `sqlite:licitacoes.db` → arquivo local
   - Em Render/outros PaaS: dados perdidos em restart/deploy
   - **Fix**: Disco persistente + `DATABASE_URL` apontando para ele

3. **Build Windows** (`STATUS-E-PROXIMOS-PASSOS.md:29`)
   - `link.exe` (MSVC) não encontrado
   - **Fix**: Compilar em Linux (Render usa Linux) ou instalar Build Tools

4. **Sem Autenticação/Autorização**
   - Endpoints públicos (`/licitacoes`, `/chat`)
   - Dados sensíveis (licitações) expostos
   - **Fix**: Planejar auth antes de contas/recursos privados

### 🟡 Médios (Qualidade/Manutenibilidade)

5. **Pagination Bug no Backend** (`routes.rs:58-64`)
   - `total = resultados.len()` **APÓS filtro** (não total real do PNCP)
   - Offset calculado sobre resultados filtrados da página atual
   - Frontend mostra "Página 1" mas `total` não reflete total real
   - **Fix**: Retornar `total` real da API PNCP (campo `total` ou `paginacao.total`)

6. **Chat Salva no DB a Cada Request** (`routes.rs:87`)
   - `salvar_licitacao` chamado em loop para cada item
   - Duplicatas possíveis (INSERT OR REPLACE por id)
   - Sem rate limiting / cache

7. **Agent Heurístico Frágil** (`agent.rs`)
   - Regex + mapa hardcoded de 30 UFs
   - Keywords TI hardcoded (28 termos)
   - Não usa LLM real - apenas correspondência de string
   - "SC" como default pode enviesar resultados

8. **Frontend: Tipos Duplicados/Desatualizados**
   - `types.ts` tem `Licitation` (campos diferentes do backend)
   - `types/dashboard.ts` usa `Opportunity` de `types.ts`
   - Backend retorna `Licitacao` (snake_case) → Frontend mapeia manualmente
   - **Fix**: Gerar tipos do OpenAPI/Schema ou compartilhar contracts

9. **Frontend: Métricas Calculadas Só na Página Atual**
   - `dashboardService.ts:60-67` soma valores apenas dos 50 itens da página
   - `detail: "Soma dos valores nesta página"` - correto mas pode confundir
   - `total` do backend não é confiável (ver #5)

10. **Sem Testes**
    - Backend: 0 testes unitários/integração
    - Frontend: 0 testes (Vitest/React Testing Library não configurados)

11. **Tratamento de Erro Genérico** (`error.rs:17-22`)
    - `anyhow::Error` → 500 "erro interno do servidor"
    - Não diferencia erros de validação, não encontrado, timeout PNCP, etc.

### 🟢 Baixos (DX/Qualidade de Código)

12. **Magic Numbers/Strings**
    - `pncp.rs:13` - 60 dias hardcoded
    - `pncp.rs:17` - clamp 1-50
    - `routes.rs:38` - clamp 10-50
    - `agent.rs:50` - default "SC"

13. **Logging Mínimo**
    - Apenas `tracing::info` no startup + error no `AppError::Anyhow`
    - Sem structured logging de requests/responses

14. **Frontend: CSS Global + Tailwind v4**
    - `index.css` define `.card`, `.scrollbar`, `.grid-bg` como utilitários globais
    - Mistura classes Tailwind + CSS customizado

15. **Sidebar: Rotas Não Implementadas**
    - 10 rotas na navegação (`/agent`, `/licitacoes`, `/pesquisa`, etc.)
    - `App.tsx:11` redireciona tudo para `/` (catch-all)
    - Placeholder visual apenas

16. **Sem Variáveis de Ambiente Documentadas**
    - Backend: `DATABASE_URL`, `PORT`
    - Frontend: `VITE_API_URL`
    - Sem `.env.example`

17. **TypeScript Strictness**
    - `tsconfig.app.json` não visível mas `types.ts` usa `Status` union
    - `any` implícito em alguns callbacks

---

## ARQUITETURA DE DADOS

### Fluxo Principal
```
Usuário → Frontend (Dashboard) → GET /licitacoes?pagina=1&tamanho=50&apenas_ti=true
                                        ↓
                                   Backend (Axum)
                                        ↓
                              reqwest → PNCP API
                                        ↓
                              Filtro TI/SaaS (keywords)
                                        ↓
                              Retorna BuscaResponse { total, pagina, resultados[] }
                                        ↓
                              Frontend: mapOpportunity() → Opportunity[]
                                        ↓
                              Calcula métricas, categorias, gráficos
                                        ↓
                              Renderiza Dashboard
```

### Fluxo Chat
```
Usuário → Frontend (futuro) → POST /chat { message }
                                        ↓
                                   Backend: interpretar_mensagem()
                                        ↓
                              Extrai UF + apenas_ti
                                        ↓
                              Busca PNCP (página 1, 50 itens)
                                        ↓
                              Filtro TI + Salva no SQLite (loop)
                                        ↓
                              Retorna ChatResponse { resposta, licitacoes[0..5] }
```

---

## CHECKLIST DE DEPLOY (do STATUS-E-PROXIMOS-PASSOS.md)

### Backend (Render)
- [ ] Build Rust no Linux (Render)
- [ ] Configurar `DATABASE_URL` para disco persistente
- [ ] Definir comando de start: `./licita-ti-api` (binário compilado)
- [ ] Verificar `/health` → `{"status":"ok"}`
- [ ] Verificar `/licitacoes` → formato esperado
- [ ] Restringir CORS ao domínio Vercel

### Frontend (Vercel)
- [ ] Definir `VITE_API_URL` = URL pública do Render (sem `/licitacoes`)
- [ ] Deploy
- [ ] Testar dashboard contra API publicada
- [ ] Verificar CORS

---

## SUGESTÕES DE PRÓXIMOS PASSOS (Ordem Recomendada)

1. **Deploy Backend**: Resolver build Linux + persistência SQLite + CORS restrito
2. **Deploy Frontend**: Configurar `VITE_API_URL` + testar integração
3. **Corrigir Paginação**: Backend retornar `total` real do PNCP
4. **Implementar Testes**: Backend (cargo test) + Frontend (Vitest)
5. **Conectar Chat**: Frontend consumir `POST /chat`
6. **Implementar Telas**: Rotas da sidebar (Agent, Licitações, Pesquisa, etc.)
7. **Autenticação**: JWT/OAuth + isolamento de dados
8. **Observabilidade**: Logs estruturados, métricas, health checks mais ricos
9. **Rate Limiting**: Proteção PNCP + API própria
10. **Cache**: Redis/In-memory para consultas PNCP frequentes

---

## COMANDOS ÚTEIS

### Backend
```bash
cd backend/licita-api
cargo build --release          # Compila otimizado
cargo run                      # Roda local (precisa .env ou defaults)
cargo test                     # Roda testes (quando existirem)
cargo check                    # Type-check rápido
```

### Frontend
```bash
cd frontend/licita-ti
npm install                    # Instala deps
npm run dev                    # Dev server (Vite)
npm run build                  # Build produção (tsc + vite build)
npm run lint                   # ESLint
npm run preview                # Preview build local
```

---

## RESUMO TÉCNICO

| Aspecto | Backend | Frontend |
|---------|---------|----------|
| **Linguagem** | Rust 2021 | TypeScript 6 |
| **Framework** | Axum 0.7 | React 19 + Vite 8 |
| **DB** | SQLite (SQLx) | N/A (stateless) |
| **API Externa** | PNCP (reqwest) | Backend próprio (axios) |
| **Estilo** | N/A | TailwindCSS v4 (dark) |
| **Roteamento** | Axum Router | React Router 7 |
| **Estado** | Request-scoped | React useState/useEffect |
| **Build** | `cargo build --release` | `npm run build` |
| **Lint/Format** | `cargo clippy` / `rustfmt` | ESLint + Prettier (não configurado) |
| **Testes** | Nenhum | Nenhum |
| **CI/CD** | Não configurado | Não configurado |

---

## ARQUIVOS-CHAVE PARA REVISÃO RÁPIDA

**Backend**:
- `backend/licita-api/src/main.rs` - Entry point + CORS
- `backend/licita-api/src/routes.rs` - Lógica de negócio dos endpoints
- `backend/licita-api/src/pncp.rs` - Integração PNCP + mapeamento
- `backend/licita-api/src/agent.rs` - Chat agent (heurístico)
- `backend/licita-api/src/filters.rs` - Keywords TI
- `backend/licita-api/src/db.rs` - Schema + persistência
- `backend/licita-api/src/config.rs` - Config via env

**Frontend**:
- `frontend/licita-ti/src/services/dashboardService.ts` - Fetch + transform + métricas
- `frontend/licita-ti/src/pages/Dashboard.tsx` - Página principal
- `frontend/licita-ti/src/layouts/AppLayout.tsx` - Shell + sidebar + health check
- `frontend/licita-ti/src/api.ts` - Axios config
- `frontend/licita-ti/src/types/dashboard.ts` - Tipos da dashboard
- `frontend/licita-ti/src/components/LicitationTable.tsx` - Tabela de dados

---

*Documento gerado para análise no ChatGPT - Licita-smart v0.1.0*