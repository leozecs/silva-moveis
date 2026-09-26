# Deploy do backend Medusa — 26/09/2026

## Release

- Imagem promovida: `silva-medusa:ea2d87a`, digest local `sha256:446eef51d4a84c38599886a212af59cda86cd72537d2773fd05f71e17fe983bf`.
- Base: commit `ea2d87a` do backend. Os commits posteriores até `5af0f88` eram de documentação.
- Compose: `/opt/silva-moveis/docker-compose.yml` com overlay `/opt/silva-moveis/docker-compose.release.yml`. Somente `medusa` foi recriado com `--no-deps --no-build`; Caddy, PostgreSQL e Redis permaneceram em execução. A porta 9000 continua no loopback da VPS.
- Imagem anterior `silva-moveis-medusa` preservada. **Não** usar `--remove-orphans`, pois o Caddy aparece como orphan nesse par de arquivos Compose.

## Proteções e smoke

- `docker compose config --quiet` passou. Dump custom-format pré-deploy: `/opt/silva-backups/deploy-ea2d87a-20260926/pre-deploy.dump`; `pg_restore --list` passou com 1046 entradas. `db:migrate` pré-deploy retornou 0.
- Container `silva-medusa-backend` usa a imagem imutável esperada e ficou `healthy`; health local e `https://srv1969702.hstgr.cloud/health` responderam 200.
- API pública `/store/products?limit=1`, com a chave **Silva Moveis Storefront**, retornou contagem 95; `/admin/products` sem autenticação retornou 401. Preflight CORS para `https://silva-moveis.vercel.app` retornou 204 com `Access-Control-Allow-Origin` correto.
- Busca no frontend `https://silva-moveis.vercel.app/api/products/search?q=mesa` retornou cinco produtos e `hasMore=true`. Logs do novo container não tiveram erros no intervalo de smoke; houve um aviso do Local Event Bus, ainda pendente de solução operacional.
- Montagem persistente de arquivos: `/opt/silva-moveis/uploads` → `/server/apps/backend/.medusa/server/static`. Persistência de upload ainda não foi testada ponta a ponta.

## Pendências e rollback

- `silvamoveis.com.br` e `www.silvamoveis.com.br` retornaram NXDOMAIN na verificação local. O domínio temporário da Vercel funcionou; resolver DNS antes de anunciar a loja.
- Login, carrinho, pedido e upload não foram homologados nesta publicação. Não confundir health com prontidão comercial.
- Em incidente, usar o Compose base `/opt/silva-moveis/docker-compose.yml` para recriar **somente** `medusa` com `up -d --no-deps --no-build medusa`, voltando à imagem preservada `silva-moveis-medusa`. Verificar health e catálogo após qualquer rollback. Não restaurar banco sem análise: as migrations atuais já foram aplicadas.
