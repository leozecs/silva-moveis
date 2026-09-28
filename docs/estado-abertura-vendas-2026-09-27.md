# Silva Móveis — estado para abertura de vendas (27/09/2026)

Atualização de 28/09: escala monetária, preços principais do catálogo e reprecificação de carrinhos corrigidos/publicados. Backups cifrados externos no Mac e restore isolado comprovados; cópia efetiva na nuvem e rotina automática ainda pendentes. Ver `docs/auditoria-catalogo-precos-backup-2026-09-28.md`; os itens monetários abaixo registram o estado histórico de 27/09.

Base: `docs/checklist-para-vender-2026-09-26.md` e *Guia do E-Commerce Alpha Design*, edição 1.0. `[x]` = evidência observada; `[ ]` = pendente. **Não liberar pagamento real enquanto G2, G4 e G5 não estiverem homologados.**

## Feito e verificado nesta rodada

- [x] Frontend distingue erro da API de catálogo vazio: falhas de conexão/HTTP/resposta inválida não retornam `[]`; tela exibe indisponibilidade com opção de tentar novamente; busca retorna 503. Código: `src/lib/medusa.ts`, `src/app/error.tsx`, `src/app/api/products/search/route.ts`.
- [x] TypeScript `tsc --noEmit`: saída 0; suíte local: 15 testes passaram.
- [x] Health público do Medusa `https://srv1969702.hstgr.cloud/health`: HTTP 200 nesta rodada. Isso **não** comprova checkout ou integridade do banco.

## Já demonstrado anteriormente, não re-homologado nesta rodada

- [x] G0: arquitetura Next.js + Medusa + PostgreSQL/Redis e frontend temporário na VPS documentados em `docs/infraestrutura.md` e `docs/deploy-frontend-vps-2026-09-26.md`.
- [x] G1: reconciliação de migrations, backup local e restore isolado documentados em `docs/reconciliacao-migrations-2026-09-26.md`.
- [x] G2: região Brasil/BRL, sales channel e 95 produtos disponíveis segundo a auditoria de 26/09; preço comercial **não** homologado.
- [x] G3: bloqueio de APIs administrativas e ownership cobertos por testes isolados; login operacional completo **não** homologado.
- [x] G6: telas do lojista e do cliente existentes; pedido pago real **não** testado.
- [x] G7: backend publicado e health/catálogo anteriores documentados em `docs/deploy-backend-2026-09-26.md`.

## Pendências — nenhuma está marcada como concluída

- [ ] G0: aprovar preços do catálogo, regra de frete/retirada, prazos, cobertura, políticas, suporte e responsáveis por incidentes/estornos; definir RPO/RTO.
- [ ] G1: backup externo cifrado **do banco e das imagens** com restore fora da VPS; testar persistência de uploads; Redis event bus/workflows/locks; alertas com dono e rollback exercitado; DNS próprio, TLS/Cloudflare e bypass de cache privado.
- [ ] G2: reconciliar os 95 SKUs com o PDF (nome, imagem, variante, medida, composição, preço); fazer backup + dry-run da correção monetária 100x; remover conversões no frontend/backend; testar totais e JSON-LD; só então habilitar `MEDUSA_PRICES_VERIFIED`. Confirmar chave publishable/canal na URL pública, upload e publicação de produto novo.
- [ ] G3: usuários operacionais individuais, permissões OWNER/ATTENDANT e MFA real; testes ponta a ponta de login e ownership. **Google OAuth e Resend excluídos por decisão do usuário**; sem Resend, recuperação por e-mail/validação de e-mail/avisos transacionais ficam indisponíveis.
- [ ] G4: Mercado Pago Orders Brasil para Pix, crédito e boleto com credenciais separadas sandbox/produção; provider compatível, Brick, instruções persistidas, webhook validado, reembolso e teste por método. Não substituir por plugin WIP sem homologação.
- [ ] G5: idempotência entre tentativa/Orders/Medusa; inbox durável, reconciliação, concorrência, reserva/baixa/liberação de estoque, expiração e falhas entre cobrança e pedido.
- [ ] G6: pedido pago controlado até entrega, transições auditadas, cancelamento/estorno/entrega parcial e suporte operacional. E-mails transacionais permanecem fora do escopo atual sem Resend ou outro provedor aprovado.
- [ ] G7: testes integrados do ambiente publicado (auth, carrinho, preço, frete, cada pagamento, webhook, pedido, estoque, mídia), ensaio de rollback/restore e revisão de rate limit, firewall, CSP, cookies e CORS.

## Ordem segura

1. Confirmar valores e frete; corrigir escala monetária em clone com backup e reconciliação por SKU.
2. Homologar estoque/frete e persistência/backups/alertas; não depender do navegador para concluir pedido.
3. Implementar Orders, webhook e reconciliação com credenciais sandbox; testar Pix/cartão/boleto, falhas e estorno.
4. Só depois habilitar credenciais de produção e realizar compra controlada com aprovação explícita do lojista.
