# Status do projeto e próximos passos

## Estado atual

A dashboard do frontend está conectada ao contrato existente da API:

- `GET /licitacoes` carrega os resultados e a tela calcula métricas, categorias e valores com base neles.
- `GET /health` verifica a disponibilidade da API.
- O frontend aceita a variável `VITE_API_URL`; se ela não estiver definida, usa `http://localhost:8080`.
- Foram criados os componentes de métricas e tabela de licitações que a dashboard precisava.
- A dashboard está ligada à rota inicial da aplicação.
- O indicador na sidebar consulta o estado real da API.
- `npm run build` e `npm run lint` passaram após essas alterações.

Arquivos principais:

- `frontend/licita-ti/src/pages/Dashboard.tsx`
- `frontend/licita-ti/src/services/dashboardService.ts`
- `frontend/licita-ti/src/api.ts`
- `frontend/licita-ti/src/App.tsx`
- `frontend/licita-ti/src/components/MetricCard.tsx`
- `frontend/licita-ti/src/components/LicitationTable.tsx`

## Bloqueios para publicação

### Backend

- A API ainda precisa ser publicada e testada em um ambiente Linux, como o Render.
- A compilação local no Windows não foi concluída: o toolchain não encontrou `link.exe`, o linker do MSVC.
- Não há configuração de deploy do backend identificada até o momento; é necessário definir como compilar e iniciar o serviço no Render.
- Depois do deploy, verificar se `GET /health` responde `{"status":"ok"}` e se `GET /licitacoes` retorna o formato esperado.

### Frontend

- Na Vercel, definir `VITE_API_URL` com a URL pública do serviço no Render, sem acrescentar o caminho `/licitacoes`.
- Fazer novo deploy do frontend depois de configurar a variável.
- Testar a dashboard publicada contra a API publicada, incluindo possíveis erros de CORS.

### Persistência e CORS

- O backend usa SQLite em arquivo local. Em hospedagem, configurar armazenamento persistente e apontar `DATABASE_URL` para o disco persistente; sem isso, os dados podem se perder em reinícios ou novos deploys.
- A API atualmente permite qualquer origem via CORS. Para produção, restringir a origem ao domínio publicado na Vercel.

## Próximas melhorias do produto

- **Implementar as telas anunciadas na navegação.** No momento, a dashboard é a única tela conectada; as demais rotas redirecionam para a inicial.
- **Ligar o chat à API.** O backend já tem `POST /chat`, mas o frontend ainda não consome esse endpoint.
- **Revisar paginação e métricas.** A dashboard calcula indicadores sobre os resultados recebidos na consulta atual, não necessariamente sobre todo o PNCP. O campo `total` da resposta do backend também deve ser verificado antes de apresentá-lo como total geral.
- **Adicionar testes** para adaptação dos dados do backend, filtros e paginação.
- **Planejar autenticação e isolamento de dados** antes de oferecer contas ou funcionalidades privadas; não há autenticação visível na API atualmente.

## Ordem recomendada para um MVP

1. Preparar o build e a inicialização do Rust no Render.
2. Publicar a API e verificar `/health` e `/licitacoes`.
3. Configurar `VITE_API_URL` na Vercel e publicar o frontend.
4. Confirmar a comunicação entre os domínios e os dados reais na dashboard.
5. Configurar persistência do SQLite e restringir CORS ao domínio publicado.
6. Implementar e testar chat, demais telas e autenticação conforme o escopo do produto.
