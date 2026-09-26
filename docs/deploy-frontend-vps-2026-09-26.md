# Frontend na VPS — 26/09/2026

## Endereço e release

- Loja temporária: `https://2-25-218-128.sslip.io/` (DNS aponta para `2.25.218.128`; TLS válido no smoke). É pública para testes, mas não substitui o domínio comercial.
- Imagem Docker: `silva-web:ab0c0ec`, gerada do commit `ab0c0ec` com `Dockerfile` standalone. Container `silva-moveis-web`, healthcheck `/api/health`, reinício automático, limite de 1 GiB e logs rotacionados. A porta 3000 só escuta em `127.0.0.1` na VPS; o Caddy acessa o container pela rede Docker privada.
- Compose: `/opt/silva-moveis/docker-compose.web.yml`, projeto `silva-web`. O Caddy mantém o Medusa em `srv1969702.hstgr.cloud` e acrescenta o host temporário para o front. Cópia da configuração anterior: `/opt/silva-backups/web-deploy-5f8a56c/Caddyfile.before`.
- O endereço temporário recebe `X-Robots-Tag: noindex, nofollow, noarchive` para evitar indexação duplicada. `silvamoveis.com.br` ainda precisa de DNS.

## Configuração

- Ambiente do web: `/opt/silva-moveis/web/.env` (permissão 600); modelo versionado em `ops/env.vps-web.example`. `MEDUSA_BACKEND_URL` usa o nome privado do container; chave pública e região Brasil/BRL são fornecidas no build e no runtime.
- `MEDUSA_MERCHANT_EMAILS=leocodes.dev@gmail.com` é verificado no servidor, junto com a identidade de usuário admin do Medusa. `SILVA_PUBLIC_ORIGIN` fixa a origem HTTPS aceita nas mutações atrás do Caddy, sem confiar em `X-Forwarded-*` vindo do cliente.
- `AUTH_CODE_SECRET` foi gerado exclusivamente na VPS. `MEDUSA_PRICES_VERIFIED=false`; a edição de preços permanece bloqueada até corrigir a escala monetária. Resend, Google OAuth e cobrança real não foram habilitados neste deploy.
- `.dockerignore` exclui arquivos `.env*` do contexto de build. O `package-lock.json` foi sincronizado com `package.json` antes de `npm ci`.

## Verificação executada

- Typecheck e 15 testes automatizados passaram; build Docker passou.
- HTTPS `/api/health` 200 com TLS válido; busca de “mesa” retornou cinco sugestões e `hasMore=true`.
- `/admin` sem sessão redireciona para `/acesso`. Login real do lojista retornou `/admin`; a página respondeu 200 com sessão e `/api/merchant?resource=products` retornou 95 produtos, 20 na primeira página.
- Front `healthy`, zero reinícios e nenhum erro nos logs inspecionados. Medusa permaneceu `healthy` com `/health` HTTPS 200.

## Próximos cuidados

- Substituir o endereço temporário pelo domínio próprio após corrigir DNS; atualizar `SILVA_PUBLIC_ORIGIN`, Caddy, CORS/OAuth quando aplicável, metadados/robots e reconstruir a imagem com URL pública definitiva.
- Homologar cadastro e e-mails somente depois de configurar Resend. Homologar carrinho, checkout, frete, pagamento e estoque antes de abrir vendas.
- Para rollback do front, usar a imagem anterior `silva-web:5f8a56c` no mesmo Compose; ela tem uma falha conhecida de origem no login e serve apenas para recuperação da vitrine. O backend Medusa não depende do container web.
