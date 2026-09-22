# Padrão de entrega — e-commerce Silva Móveis

Este documento define o mínimo necessário para entregar uma loja virtual real, responsiva, segura, observável e capaz de vender. O item só deve ser marcado como concluído quando houver evidência: URL, captura, log, teste ou documento de configuração.

## 0. Critério de pronto

- [ ] Cliente consegue navegar no catálogo, buscar, filtrar e abrir um produto.
- [ ] Produto possui preço, variante, estoque, imagens e regras de venda reais.
- [ ] Cliente consegue criar conta, entrar, recuperar acesso e sair.
- [ ] Cliente consegue montar carrinho, informar endereço, escolher frete e pagar.
- [ ] Pedido aprovado aparece no admin e dispara confirmação ao cliente.
- [ ] Pagamentos pendentes, recusados, cancelados, estornados e aprovados têm tratamento definido.
- [ ] Admin consegue cadastrar produtos, preço, estoque, categoria, promoção, pedido e status.
- [ ] Banco tem backup testado, migrações versionadas e restauração validada.
- [ ] Frontend, backend, banco, domínio, DNS, TLS, monitoramento e webhooks foram testados em produção.
- [ ] Não existem dados mockados, credenciais no Git ou rotas críticas sem tratamento de erro.

## 1. Negócio e operação

- [ ] Definir catálogo inicial, categorias, coleções e produtos vendáveis.
- [ ] Definir variantes: medida, cor, acabamento, montagem e SKU.
- [ ] Definir preço, preço promocional, custo, margem, validade e moeda.
- [ ] Definir estoque por local, reserva de estoque e política de ruptura.
- [ ] Definir regiões atendidas, prazo, transportadoras e tabela de frete.
- [ ] Definir retirada, entrega própria, montagem e restrições por CEP.
- [ ] Definir política de troca, devolução, cancelamento e reembolso.
- [ ] Definir canais de atendimento, horário, WhatsApp, e-mail e SLA.
- [ ] Definir emissão fiscal e integração contábil necessária para a operação brasileira.
- [ ] Definir responsáveis por catálogo, pedidos, financeiro, suporte e infraestrutura.

## 2. Frontend e experiência

- [ ] Header responsivo com logo, busca ampla, conta, carrinho e navegação.
- [ ] Menu mobile, dropdowns, foco de teclado e fechamento acessível.
- [ ] Home sem conteúdo fictício: hero, categorias, produtos, benefícios e chamadas reais.
- [ ] Catálogo com paginação ou carregamento incremental, busca, filtros e ordenação.
- [ ] Página de produto com galeria, preço, variante, estoque, prazo e ação de compra.
- [ ] Carrinho com quantidade, remoção, subtotal, frete, cupom e total.
- [ ] Checkout com identificação, endereço, frete, pagamento, revisão e confirmação.
- [ ] Minha conta com dados pessoais, endereços, pedidos e logout.
- [ ] Admin/lojista separado do storefront e protegido por autenticação e permissões.
- [ ] Estados de carregamento, vazio, erro, indisponibilidade e manutenção.
- [ ] Layout testado em mobile, tablet, desktop e Safari.
- [ ] Acessibilidade: contraste, labels, teclado, leitores de tela, alt text e foco visível.
- [ ] SEO: title, description, canonical, sitemap, robots, Open Graph e dados estruturados.
- [ ] Performance: imagens otimizadas, fontes controladas, LCP/CLS/INP acompanhados.
- [ ] Analytics e consentimento de cookies configurados conforme a política da loja.
- [ ] Nenhum segredo em `NEXT_PUBLIC_*`; essas variáveis ficam expostas no navegador.

## 3. Frontend ↔ Medusa

- [ ] Frontend usa a URL do backend por variável de ambiente.
- [ ] Código server-side prioriza `MEDUSA_BACKEND_URL`.
- [ ] Código público usa apenas configurações que podem ser expostas, como publishable key.
- [ ] Consultas de catálogo não retornam mock quando a Medusa estiver indisponível.
- [ ] Respostas vazias, 4xx, 5xx, timeout e CORS têm UI adequada.
- [ ] Produtos e categorias são consumidos pela Store API.
- [ ] Carrinho é criado e persistido na Medusa, não apenas no estado local.
- [ ] Cliente é associado ao carrinho antes do checkout.
- [ ] Endereço, região, moeda, sales channel e shipping options são enviados corretamente.
- [ ] Front atualiza dados do catálogo sem cache obsoleto; a vitrine atual usa `no-store` e refresh periódico.
- [ ] Testar mudança de produto no admin e verificar a alteração no frontend.
- [ ] Testar mudança de estoque e verificar indisponibilidade no frontend.
- [ ] Testar expiração de sessão, logout e acesso a conta sem token.

## 4. Medusa backend

- [ ] Fixar versões de Node, pnpm e Medusa.
- [ ] Manter `medusa-config.ts` versionado e sem segredos.
- [ ] Configurar Postgres, Redis, CORS, JWT secret e cookie secret.
- [ ] Configurar módulos de produto, preço, inventário, vendas, cliente, pedido e pagamento.
- [ ] Criar usuário admin da operação e revisar permissões.
- [ ] Criar região Brasil, BRL, sales channel e publishable API key.
- [ ] Cadastrar categorias, coleções, produtos, variantes, preços e imagens reais.
- [ ] Criar stock location, inventory items, níveis de estoque e regras de reserva.
- [ ] Configurar opções de frete, provedores de fulfillment e cálculo por CEP.
- [ ] Configurar impostos ou integração fiscal aplicável.
- [ ] Configurar promoções, cupons e regras de elegibilidade.
- [ ] Configurar autenticação de cliente, recuperação de senha e sessão.
- [ ] Configurar jobs, filas e tarefas assíncronas com Redis quando aplicável.
- [ ] Criar endpoint de healthcheck e validar resposta 200.
- [ ] Validar CORS para domínio de produção, preview autorizado e admin.
- [ ] Executar migração em staging antes de produção.
- [ ] Executar migração em produção antes de subir o novo backend.
- [ ] Não executar seed/demo em banco de produção.
- [ ] Registrar versão do backend e hash do commit implantado.

## 5. Pagamento Mercado Pago

- [ ] Criar ou validar conta Mercado Pago da empresa.
- [ ] Separar credenciais de teste e produção.
- [ ] Guardar access token somente no backend/VPS ou secret manager.
- [ ] Configurar provider Mercado Pago na Medusa.
- [ ] Validar compatibilidade e versão do plugin adotado.
- [ ] Configurar URL pública HTTPS de webhook.
- [ ] Validar assinatura/segredo do webhook.
- [ ] Implementar idempotência por evento e identificador de pagamento.
- [ ] Mapear estados: `pending`, `approved`, `authorized`, `rejected`, `cancelled`, `refunded`.
- [ ] Confirmar pedido somente após a confirmação confiável do pagamento.
- [ ] Não baixar estoque duas vezes após reentrega de webhook.
- [ ] Testar cartão aprovado, recusado, pagamento pendente e cancelamento.
- [ ] Testar retorno do cliente sem confiar apenas no redirect do navegador.
- [ ] Testar reembolso total/parcial e conciliação no admin.
- [ ] Registrar erros sem gravar token, CVV ou dados sensíveis.
- [ ] Confirmar requisitos PCI e escopo de responsabilidade da loja.

## 6. Banco de dados PostgreSQL

- [ ] Banco PostgreSQL de produção separado de desenvolvimento e staging.
- [ ] Usuário da aplicação sem privilégios administrativos desnecessários.
- [ ] Senha forte, única e armazenada fora do Git.
- [ ] TLS/SSL entre aplicação e banco quando suportado pelo provedor.
- [ ] Volume persistente configurado e identificado.
- [ ] Migrações versionadas, revisadas e executadas por pipeline ou runbook.
- [ ] Backup automático diário e retenção definida.
- [ ] Backup fora da VPS para reduzir risco de perda do host.
- [ ] Restauração testada em banco separado.
- [ ] Point-in-time recovery avaliado para a criticidade da loja.
- [ ] Monitorar conexões, espaço, locks, latência e crescimento.
- [ ] Definir política de retenção, anonimização e exclusão de dados pessoais.
- [ ] Nunca apagar volume de produção para “corrigir” migração sem backup e aprovação.

## 7. VPS, Docker e rede

- [ ] Ubuntu atualizado e acesso SSH somente por chave.
- [ ] Usuário operacional sem uso rotineiro de root.
- [ ] Firewall liberando apenas SSH restrito, HTTP e HTTPS.
- [ ] Portas de Postgres, Redis e Medusa não expostas publicamente sem necessidade.
- [ ] Docker e Docker Compose atualizados e com versões registradas.
- [ ] `.env` da VPS fora do Git e com permissões restritas.
- [ ] `docker-compose.yml` validado com `docker compose config`.
- [ ] Postgres e Redis com healthcheck e restart policy.
- [ ] Medusa somente é promovida após migration e healthcheck aprovados.
- [ ] Volumes persistentes para banco e arquivos que não podem ser perdidos.
- [ ] Limites de CPU/memória avaliados para o plano da VPS.
- [ ] Logs com rotação; não deixar o disco crescer indefinidamente.
- [ ] Monitorar CPU, RAM, disco, containers e reinícios.
- [ ] Atualizações do sistema e janela de manutenção definidas.
- [ ] Fail2ban ou proteção equivalente avaliada para SSH.
- [ ] Reverse proxy configurado para terminar TLS e encaminhar para Medusa.
- [ ] Processo de rollback documentado e testado.
- [ ] Script de sincronização em [`ops/deploy-vps.sh`](ops/deploy-vps.sh) executado somente após validar migração.

## 8. Cloudflare e domínio

- [ ] Domínio registrado e renovação automática ativa.
- [ ] DNS com registros corretos para frontend e backend.
- [ ] Proxy Cloudflare ativado onde aplicável.
- [ ] SSL/TLS em `Full (strict)`.
- [ ] Certificado válido no origin/reverse proxy.
- [ ] Redirecionar HTTP para HTTPS.
- [ ] Definir domínio canônico e redirecionar `www` ou raiz de forma consistente.
- [ ] Cloudflare WAF e regras gerenciadas habilitados.
- [ ] Rate limit para login, checkout, webhook e endpoints sensíveis.
- [ ] Bot protection ajustada sem bloquear clientes legítimos.
- [ ] Cache somente para conteúdo público seguro.
- [ ] Não cachear `/api`, `/admin`, login, checkout, carrinho ou webhook.
- [ ] Configurar DNSSEC se o registrador suportar.
- [ ] Revisar SPF, DKIM e DMARC do domínio de e-mail.
- [ ] Ocultar IP do origin e aceitar tráfego somente do reverse proxy quando possível.
- [ ] Documentar como purgar cache e alterar DNS em emergência.

## 9. Vercel e entrega do frontend

- [ ] Projeto correto vinculado ao repositório e ao diretório correto.
- [ ] Build reproduzível com lockfile versionado.
- [ ] Variáveis separadas por Development, Preview e Production.
- [ ] `MEDUSA_BACKEND_URL` configurada server-side em produção.
- [ ] `NEXT_PUBLIC_MEDUSA_BACKEND_URL` usada somente se a chamada pública direta for necessária.
- [ ] `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` configurada sem segredo privado.
- [ ] `NEXT_PUBLIC_MEDUSA_REGION_ID` configurada para a região correta.
- [ ] URL pública do frontend incluída no `STORE_CORS` e `AUTH_CORS`.
- [ ] Deployment Protection ajustada conforme a necessidade de storefront público.
- [ ] Domínio, redirects, headers e política de cache validados.
- [ ] Logs de build e runtime revisados após cada deploy.
- [ ] Preview testado antes de promover produção.
- [ ] Rollback para o último deploy saudável documentado.
- [ ] Token de CI guardado como secret, nunca no repositório.
- [ ] Deploy atômico: migration/infra primeiro, frontend depois, promoção por último.

## Infraestrutura — evidência do capítulo

Base versionada em [`docs/infraestrutura.md`](docs/infraestrutura.md), [`docker-compose.prod.yml`](docker-compose.prod.yml) e scripts em `ops/`.

- [x] Compose de produção separa staging do storefront da Vercel.
- [x] PostgreSQL e Redis sem portas públicas no compose de produção.
- [x] Volumes persistentes, healthchecks, limites de memória e rotação de logs definidos.
- [x] Backup PostgreSQL antes da promoção documentado em [`ops/backup-postgres.sh`](ops/backup-postgres.sh).
- [x] Health check de API, banco, Redis e disco documentado em [`ops/healthcheck-vps.sh`](ops/healthcheck-vps.sh).
- [x] Diagrama de topologia e relacionamento de dados documentado.
- [ ] Aplicar o compose na VPS Hostinger e registrar `docker compose config`.
- [ ] Confirmar firewall, reverse proxy/TLS, portas efetivamente expostas e rate limit.
- [ ] Executar backup real, copiar para fora da VPS e testar restore em banco separado.
- [ ] Configurar monitoramento externo, alertas e rotina de rollback.

## 10. E-mail, comunicação e dados do cliente

- [ ] Provedor transacional configurado.
- [ ] Remetente validado no domínio.
- [ ] Templates de confirmação, pagamento, envio, cancelamento e recuperação de senha.
- [ ] E-mails de erro não expõem stack trace nem credenciais.
- [ ] WhatsApp e canais de suporte exibem o número correto.
- [ ] Preferências de comunicação e opt-in registrados.
- [ ] Exportação e exclusão de dados do cliente definidas.

## 11. Segurança e LGPD

- [ ] HTTPS obrigatório em todas as rotas.
- [ ] Segredos fora do Git, fora de logs e fora de variáveis públicas.
- [ ] Rotação de JWT, cookie, banco, Mercado Pago e SSH documentada.
- [ ] Cookies `HttpOnly`, `Secure` e `SameSite` adequados ao fluxo.
- [ ] Proteção contra brute force no login.
- [ ] Validação de payloads no backend.
- [ ] Dependências auditadas e atualizadas com janela de mudança.
- [ ] Política de privacidade, termos de uso e política de troca publicados.
- [ ] Base legal e finalidade de cada dado pessoal documentadas.
- [ ] Consentimento de cookies/marketing conforme necessidade.
- [ ] Processo para acesso, correção, portabilidade e exclusão de dados.
- [ ] Registro de incidentes e contato do responsável definido.

## 12. Observabilidade e suporte

- [ ] Monitor externo verifica frontend, backend e healthcheck.
- [ ] Alertas para indisponibilidade, erro 5xx, webhook falho, disco cheio e banco sem backup.
- [ ] Logs centralizados ou exportados fora do container.
- [ ] Correlation/request ID para rastrear pedido entre frontend, Medusa e pagamento.
- [ ] Dashboard de pedidos, pagamentos e falhas disponível ao lojista.
- [ ] Auditoria de alterações administrativas habilitada ou documentada.
- [ ] Teste sintético de login, catálogo, carrinho e checkout.
- [ ] Runbook de incidente: identificar, conter, comunicar, recuperar e revisar.
- [ ] Contatos de Vercel, Hostinger, Cloudflare e Mercado Pago registrados.

## 13. Testes de aceite antes de vender

| Fluxo | Resultado esperado | Evidência | Status |
|---|---|---|---|
| Home/catalogo | Produtos e categorias reais da Medusa | URL + captura | [ ] |
| Busca/filtro | Resultado correto e estado vazio | URL + teste | [ ] |
| Produto | Preço, variante e estoque reais | Captura | [ ] |
| Conta | Login, sessão e logout funcionam | Log + captura | [ ] |
| Carrinho | Totais e itens persistem | Pedido de teste | [ ] |
| Frete | Opção e prazo corretos | Pedido de teste | [ ] |
| Pagamento aprovado | Pedido vira pago e reserva estoque | Mercado Pago + Medusa | [ ] |
| Pagamento pendente | Pedido aguarda confirmação | Webhook/log | [ ] |
| Pagamento recusado | Cliente recebe orientação e pedido não é aprovado | Captura | [ ] |
| Webhook duplicado | Nenhum pedido/baixa duplicada | Log | [ ] |
| Admin | Lojista edita catálogo e acompanha pedido | Captura | [ ] |
| Mobile/Safari | Fluxo completo sem quebra | Captura | [ ] |
| Backup | Restauração em ambiente separado | Relatório | [ ] |
| Rollback | Versão anterior volta sem perda de dados | Log | [ ] |

## 14. Runbook de publicação

1. Congelar mudanças e conferir o commit que será publicado.
2. Fazer backup e validar que há restauração possível.
3. Validar variáveis e CORS de produção.
4. Construir a imagem do backend e executar `db:migrate`.
5. Subir Medusa e validar `/health` e logs.
6. Conferir produtos, região, sales channel, estoque e provider de pagamento.
7. Publicar o frontend em Preview e executar os testes de aceite.
8. Configurar/confirmar DNS, TLS e webhooks.
9. Promover o frontend para Production.
10. Executar smoke test de navegação, login, carrinho e pagamento de teste.
11. Monitorar logs, pedidos e webhooks após a abertura da loja.

## 15. Mac e Windows

### Mac

- [ ] Homebrew instalado para ferramentas de desenvolvimento.
- [ ] Node LTS, Corepack/pnpm e Docker Desktop instalados.
- [ ] Usar caminhos Unix, por exemplo `/Users/leo/Documents/ChatGPT/silva-moveis`.
- [ ] Usar `curl`, `ssh` e `docker compose` no Terminal.
- [ ] Conferir permissões do arquivo `.env` e da chave SSH.

### Windows

- [ ] Preferir WSL2 + Ubuntu para manter comandos compatíveis com a VPS.
- [ ] Alternativa: PowerShell com Docker Desktop, Node LTS e OpenSSH.
- [ ] No PowerShell, comandos de ambiente usam `$env:NOME="valor"`.
- [ ] No CMD, usam `set NOME=valor`; não misturar sintaxe com bash.
- [ ] Conferir conversão de quebras de linha CRLF/LF em scripts shell.
- [ ] Usar caminhos WSL como `/mnt/c/Users/usuario/projeto`.
- [ ] Nunca enviar `.env`, chaves ou tokens por copiar/colar em chats ou issues.

## Estado atual da Silva Móveis

- [x] Frontend Next.js conectado à camada de leitura da Medusa.
- [x] Leituras de catálogo sem cache obsoleto e atualização periódica da vitrine.
- [x] Base de `docker-compose` com healthchecks e CORS configurável.
- [x] Runbook de deploy da VPS versionado em `ops/deploy-vps.sh`.
- [ ] VPS com migrações Medusa concluídas.
- [ ] Backend Medusa saudável e público via HTTPS.
- [ ] Região, moeda, sales channel, publishable key, produtos e estoque reais.
- [ ] Variáveis de produção configuradas na Vercel.
- [ ] Mercado Pago em produção com webhook validado.
- [ ] Carrinho e checkout real concluídos.
- [ ] Backup e restauração da base de produção testados.
- [ ] Testes de aceite completos e loja liberada para vender.

## Definição de evidência

Para cada item concluído, registrar pelo menos um destes dados: URL, ambiente, data, commit, captura, comando executado, trecho de log ou responsável. “Funciona localmente” não é evidência de produção.
