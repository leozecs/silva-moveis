# Silva Móveis: checklist para abrir vendas

Base: *Guia do E-Commerce Alpha Design*, edição 1.0, especialmente capítulos 17–33 e gates G0–G7. Estado conferido em 26/09/2026 contra código, testes e VPS. `[x]` indica evidência desta entrega; `[ ]` exige execução ou comprovação. Código existente não equivale a fluxo de venda homologado.

## Bloqueadores imediatos

- [ ] **Corrigir preços antes de cobrar.** Os 95 produtos importados têm escala 100 vezes maior no Medusa; a vitrine compensa dividindo por 100. Conferir preço por SKU com catálogo, migrar dados com backup e dry-run, retirar conversões espalhadas, comparar produto, carrinho, pedido e JSON-LD. Só depois habilitar `MEDUSA_PRICES_VERIFIED=true`. Aceite: preço de teste R$ 50,00 permanece R$ 50,00 em todas as etapas (guia, cap. 17).
- [ ] **Decidir frete com o lojista.** Definir cotação antes da cobrança ou retirada/frete separado com comunicação e política explícitas. Cadastrar opção real e testar mudança de CEP/endereço (cap. 17).
- [ ] **Ligar pagamento real via Mercado Pago Orders.** Credenciais e métodos Pix, crédito e boleto faltam; a configuração observada na VPS não contém access token. Validar provider compatível com Orders, habilitar na região, Public Key do mesmo ambiente, Brick estável, instruções recuperáveis e reembolso/cancelamento (caps. 18–23).
- [ ] **Webhook + reconciliação.** Assinatura, inbox durável ou resposta após persistência, vínculo de tentativa, valor/moeda, replay, evento fora de ordem, browser fechado, falha entre cobrança e pedido; alarme para pagamento aprovado sem pedido (caps. 24–25, 32).
- [ ] **Reserva e baixa ponta a ponta.** Testar último item com dois clientes, Pix/boleto vencidos, recusa, cancelamento, pagamento tardio, fulfillment e estoque final. Definir job e política compatíveis com vencimento da cobrança (cap. 26).

## G0 — decisões comerciais e arquitetura

- [x] Next.js na Vercel, Medusa na VPS, PostgreSQL/Redis privados; responsabilidades e dados descritos em `docs/infraestrutura.md`.
- [ ] Aprovar valores, condições de frete/retirada, prazos, alcance de entrega, política de troca, contato e atendimento reais. Revisar textos legais/LGPD com responsável pelo negócio (caps. 04, 17, 29).
- [ ] Formalizar quem atende pedidos, incidentes, estorno e perda de estoque; definir RPO/RTO do banco (caps. 31–32).

## G1 — plataforma

- [x] VPS acessível; proxy HTTPS Caddy; Postgres e Redis sem portas públicas; Medusa limitado a `127.0.0.1:9000`. Contagem pré-deploy: 95 produtos. Backup local verificável em `/opt/silva-backups/43d2870/postgres.dump` e imagem anterior marcada para rollback.
- [ ] Validar restore desse dump em banco separado, sem tocar no banco vivo; agendar cópia externa cifrada e backup de mídia. Backup na própria VPS não cobre perda da máquina (caps. 07, 31).
- [ ] Persistir uploads num volume testado; configurar URL HTTPS correta do provider de arquivos; testar upload, leitura, exclusão e rebuild sem perder foto (cap. 10).
- [ ] Configurar Redis explicitamente para event bus/workflows/locks onde necessário; o log observado ainda advertia sobre Local Event Bus. Medir reinício/retry (cap. 08).
- [ ] Monitorar API, banco, Redis, disco, proxy e catálogo; alertas com dono, health externo e rollback exercitado (cap. 32).
- [ ] Validar DNS autoritativo, domínio próprio, TLS e regra Cloudflare sem cache de auth, carrinho, checkout, webhook ou Admin; webhook sem desafio interativo (cap. 11).

## G2 — comércio e catálogo

- [x] Região Brasil/BRL, canal e catálogo de 95 produtos disponíveis na API. Frontend busca esses produtos; variantes e cores vêm do Medusa.
- [ ] Conferir cada SKU, imagem, variante, medida, composição e preço com o PDF Silva Móveis 2026. Registrar divergências; importação repetida não pode duplicar (caps. 09–10).
- [ ] Corrigir escala monetária conforme bloqueador acima e confirmar produto publicado, canal, chave pública, região e estoque por variante (caps. 09, 17).
- [ ] Testar produto novo no painel até catálogo, busca, variante, carrinho e total oficial; no painel atual a edição monetária fica bloqueada até correção (cap. 09).
- [ ] Simular API indisponível: erro deve ser distinguido de catálogo vazio confirmado; testar cache frio e revalidação (cap. 15).

## G3 — identidade

- [x] APIs administrativas exigem identidade Medusa e allowlist no servidor. Testes isolados cobriram cliente/lojista, ownership de duas contas, CSRF, carrinho, endereços e logout.
- [ ] Configurar Google OAuth real e testar conta nova/existente, state, callback, expiração e acesso administrativo negado (cap. 14).
- [ ] Configurar Resend e endurecer código de seis dígitos, tentativas, reenvio, reset de senha de uso único e invalidação de sessão; testar e-mail recebido (caps. 14, 28).
- [ ] Criar usuários operacionais individuais; testar permissões OWNER/ATTENDANT e MFA no backend. E-mail conhecido no frontend não concede papel administrativo (caps. 27, 29).

## G4 — pagamento

- [ ] Homologar Pix por Orders API: criar pela loja, recuperar QR/copia-e-cola após reload, consultar status oficial, pedido único e evento espontâneo. QR emitido não prova pagamento (cap. 21).
- [ ] Homologar cartão: Brick oficial, tokenização sem PAN/CVV no servidor, aprovação, recusa, pendência, token inválido, dois cliques, 3DS se habilitado (cap. 22).
- [ ] Homologar boleto: documento, linha digitável, vencimento e pendência. Registrar que emissão sandbox não prova compensação final (cap. 23).
- [ ] Separar credenciais sandbox/produção; compra real controlada só com valor e estorno autorizados pelo lojista (cap. 33).

## G5 — recuperação

- [ ] Integração com fornecedor precisa compartilhar chave idempotente entre criação, retry e consulta; unique constraints e lock por carrinho; reparar timeout, falha de DB e evento duplicado (caps. 24–25).
- [ ] Testar reposição de estoque após recusa/expiração e impedir liberação prematura de Pix/boleto pagável; crash e recuperação de job (cap. 26).
- [ ] Testar duas abas, outro cliente, 503, sessão vencida, pedido único e cache correto. Testes locais atuais não são evidência de aprovação do provedor (cap. 30).

## G6 — operação

- [x] Painel do lojista tem produtos, categorias, estoque, notificações visuais, pedidos, detalhes e avanço logístico por workflow nativo. Cliente consulta status; polling a cada 15 segundos.
- [ ] Executar pedido pago controlado da preparação à entrega; auditar ator, data e transições; dupla ação não pode enviar nem mandar e-mail duas vezes (cap. 27).
- [ ] Verificar Resend: domínio/remetente, DNS SPF/DKIM/DMARC, recebimento, bounce, retry e idempotência durável. Provider/subscriber em código ainda não provam entrega (cap. 28).
- [ ] Definir suporte operacional e exceções: reembolso, produto indisponível, entrega parcial, erro de endereço e contestação (caps. 20, 27–28).

## G7 — liberação

- [ ] Backend novo na VPS com migration concluída e smoke de health, 95 produtos, login, carrinho, API privada e logs. Registrar SHA e imagem final. Não marcar apenas porque build passou (cap. 31).
- [ ] Verificar frontend/VPS no mesmo ambiente e domínio, secrets fora do bundle, CORS e cookies; revisar rate limit, firewall, CSP e headers sem quebrar compra (caps. 05, 11–12, 29).
- [ ] Ensaiar rollback e restore; confirmar que backup externo e imagens sobrevivem à perda da VPS (cap. 31).
- [ ] Rodar matriz final: cliente novo/existente, login, produto, variante, endereço, frete, Pix/crédito/boleto, webhook, pedido, estoque, e-mail, cancelamento e recuperação com evidência por método (caps. 30, 33).

## Critério de abertura

Liberar venda somente quando preço, frete, pagamento, confirmação externa, estoque e recuperação de pedidos tiverem evidência. Checkout visual e health HTTP não satisfazem esses critérios.
