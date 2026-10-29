# Como rodar o Licita Smart

Guia de execução local do backend (.NET 10) e do frontend (React + Vite), com o checklist de estabilização antes de iniciar o agente de IA.

## Stack

| Camada | Tecnologia | Porta padrão |
|---|---|---|
| Backend | .NET 10 / ASP.NET Core / EF Core + Npgsql | `8081` |
| Frontend | React 19 + Vite + Tailwind | `5173` (ou próxima livre) |
| Banco | PostgreSQL | `5432` |

## Pré-requisitos

- .NET SDK 10
- Node.js 20+ e npm
- PostgreSQL acessível em `localhost:5432`
- Docker (opcional, para subir o Postgres)

## Banco de dados

O backend usa a connection string `ConnectionStrings:DefaultConnection` de `src/LicitaSmart.Api/appsettings.Development.json`.

Esse arquivo é **local e ignorado pelo git** (pode conter credenciais). Use o exemplo versionado como base:

```bash
cd backend/licitasmart.Api/src/LicitaSmart.Api
cp appsettings.Development.example.json appsettings.Development.json
```

Depois edite `appsettings.Development.json` com os dados do seu Postgres:

```text
Host=localhost;Port=5432;Database=licitasmart;Username=lfadmin;Password=SUA_SENHA
```

Alternativamente, defina por variável de ambiente (sem editar o arquivo):

```bash
export ConnectionStrings__DefaultConnection="Host=localhost;Port=5432;Database=licitasmart;Username=lfadmin;Password=SUA_SENHA"
```

Criar o banco no container local (exemplo):

```bash
docker exec lf-postgres psql -U lfadmin -d lfcloud -c "CREATE DATABASE licitasmart OWNER lfadmin;"
```

> Observação: hoje o backend usa `Database.EnsureCreatedAsync()` no startup. A troca por migrations está no checklist de estabilização (veja abaixo).

## Backend

A partir da raiz do repositório:

```bash
cd backend/licitasmart.Api
dotnet run --project src/LicitaSmart.Api --launch-profile http
```

O perfil `http` sobe em `http://localhost:8081`.

Build e testes:

```bash
dotnet build LicitaSmart.slnx
dotnet test LicitaSmart.slnx
```

Verificação rápida:

```bash
curl http://localhost:8081/health
curl "http://localhost:8081/licitacoes?page=1&pageSize=10"
```

### Endpoints atuais

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/licitacoes` | Lista com filtros e paginação |
| GET | `/licitacoes/{id}` | Detalhe da licitação |
| GET | `/api/licitacoes` | Alias do listar |

Parâmetros de `/licitacoes`: `uf`, `municipio`, `orgao`, `modalidade`, `situacao`, `page`, `pageSize`.

## Frontend

```bash
cd frontend/licita-ti
npm install
npm run dev
```

Build e lint:

```bash
npm run build
npm run lint
```

### Configuração da API

O frontend lê `VITE_API_URL` em `src/api.ts`. Sem a variável, usa `http://localhost:8081`.

Crie `frontend/licita-ti/.env`:

```env
VITE_API_URL=http://localhost:8081
```

> Importante: o Vite lê o `.env` apenas na inicialização. Depois de criar/alterar o arquivo, reinicie o `npm run dev`.

## Troubleshooting: sidebar mostra "API indisponível"

O status fica no rodapé da sidebar e é alimentado por `healthCheck()` em `src/api.ts`.

Causas comuns e onde corrigir:

1. **URL da API divergente**: se o processo do Vite foi iniciado com `VITE_API_URL` apontando para outra porta (ex.: `5193`), o navegador consulta a porta errada. Confira o `.env` e reinicie o Vite.
2. **Health check sem retry**: em `src/layouts/AppLayout.tsx`, o `useEffect` roda uma única vez no mount. Se a API estava fora naquele momento, o status continua vermelho até um F5.
3. **API escutando só em localhost**: se você acessa o frontend por IP remoto, túnel ou port forwarding, `http://localhost:8081` no navegador aponta para a sua máquina, não para o servidor. Nesse caso suba a API em `0.0.0.0`:

   ```bash
   ASPNETCORE_URLS=http://0.0.0.0:8081 dotnet run --project src/LicitaSmart.Api --no-launch-profile
   ```

   E use no `.env` o host/IP acessível pelo navegador.

4. **Porta ocupada**: confira com `ss -ltnp | grep 8081` e encerre instâncias antigas da API.
5. **CORS**: o backend libera `AllowAnyOrigin` em desenvolvimento; se mudar a política, ajuste também a origem do frontend.

Validação direta com CORS:

```bash
curl -i -H "Origin: http://localhost:5174" http://localhost:8081/health
```

## Troubleshooting: telas lentas ou que não carregam

Medições de referência (localhost):

| Item | Tempo |
|---|---|
| API `/health` | ~2 ms |
| API `/licitacoes` | ~4–20 ms |
| Vite respondendo | ~1–5 ms |
| Load completo (Chrome headless) — Dashboard | ~1,2 s |
| Load completo — Licitações | ~2,3 s |
| Load completo — Agent | ~1,4 s |

Ou seja: o gargalo normalmente **não é a API**. Se as telas não carregam, verifique o ambiente do Vite.

Causas comuns:

1. **Dev server morreu**: se a porta do Vite foi fechada junto com o terminal (ex.: `5175`), o navegador recebe `ERR_CONNECTION_REFUSED`. Suba o processo desanexado do shell:

   ```bash
   setsid bash -c 'exec npm run dev -- --host 0.0.0.0 --port 5174 --strictPort' \
     > /tmp/licitasmart-web.log 2>&1 < /dev/null &
   ```

   Alternativa: rodar dentro de `tmux`/`screen`.

2. **Vários Vite/API ao mesmo tempo** (ex.: `5174` e `5175`, `8081` e `5193`). Mantenha apenas um de cada e encerre os antigos. Confira com `ss -ltnp | grep -E ':5174|:5175|:8081|:5193'`.

3. **`VITE_API_URL` "assada" no processo**: um Vite iniciado com `VITE_API_URL=http://localhost:5193` continua usando a porta antiga mesmo depois de você subir a API em `8081`. Crie/ajuste o `.env` e **reinicie** o Vite.

4. **Vite em modo dev compila módulos sob demanda** (~2000 módulos). O primeiro load e cada *full reload* do HMR são mais lentos que a API. Para separar custo de dev do custo real, compare com produção:

   ```bash
   npm run build
   npm run preview
   ```

5. **Rotas da sidebar sem página**: `Pesquisa`, `Monitoramento`, `Alertas`, `Fornecedores`, `Favoritos`, `Análises`, `Relatórios`, `Integrações` e `Settings` ainda não existem em `App.tsx`. O catch-all `<Navigate to="/" replace />` redireciona tudo para o Dashboard, parecendo "tela que não abre". Implemente a rota ou remova o link.

6. **Health check roda uma vez só**: em `src/layouts/AppLayout.tsx:94-109` o `useEffect` não tem polling. Se a API estava fora no load, o status fica vermelho até F5. Adicione intervalo de verificação (~30 s).

## Estabilização antes do agente de IA

O agente fica fora desta entrega até os itens abaixo estarem concluídos.

### Base

- [ ] Alinhar versões EF Core/Npgsql (remover warning MSB3277)
- [ ] Trocar `EnsureCreatedAsync` por migrations + `DbSeeder` separado
- [ ] Registrar todos os serviços no `Program.cs` (Auth, Órgãos, Favoritos, PNCP)
- [ ] `GlobalExceptionHandler` com ProblemDetails
- [ ] CORS, JWT e PNCP configuráveis por `appsettings`/variáveis de ambiente
- [ ] `.gitignore` cobrindo `bin/`, `obj/`, `dist/` e `.env`
- [ ] `appsettings` e `.env.example` documentados

### Backend

- [ ] DTOs tipados no lugar de `object` anônimo
- [ ] Auth JWT (register/login/me) com hash de senha
- [ ] Órgãos e Favoritos com validação e unicidade
- [ ] PNCP com retry/backoff, tratamento de 204/429 e upsert idempotente
- [ ] Sync automático + `POST /integracoes/pncp/sync`
- [ ] Filtro `apenas_ti` e Opportunity Score no backend
- [ ] Testes de regras críticas (filtros, auth, favoritos, mapping PNCP)

### Frontend

- [ ] Health check com polling/retry e indicador estável
- [ ] Filtros, paginação e estados de loading/erro/vazio em Licitações
- [ ] Login/Registro, rotas protegidas e Favoritos
- [ ] Client Axios com interceptor de autenticação
- [ ] `npm run build` e `npm run lint` sem erros

### Gate para iniciar o agente

- API sobe com banco vazio, aplica migration e popula via PNCP sem intervenção
- Nenhum endpoint retorna 500 por falta de registro no DI
- Falhas do PNCP (429/timeout) não derrubam a API nem perdem dados
- Frontend reflete online/offline sem F5
- Nenhuma credencial ou URL fixa no código

## Agente de IA (próxima fase)

Depois do gate acima, entra o endpoint `POST /chat`:

```json
{ "message": "Encontre licitações de SaaS em Santa Catarina" }
```

Resposta esperada:

```json
{
  "resposta": "Encontrei ...",
  "licitacoes": []
}
```

A primeira versão será determinística (interpretação de UF, município, categoria, valor, modalidade, situação, prazo e filtro de TI), com interface pronta para trocar por um provedor LLM depois.
