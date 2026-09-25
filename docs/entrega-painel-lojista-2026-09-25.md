# Entrega incremental — vitrine e painel do lojista

Data: 25/09/2026. Complementa o guia do ecommerce e o checklist operacional; não declara a loja pronta para cobrar.

## Implementado

- Logo PNG com transparência, preservando o desenho de referência, utilizada na header e no acesso.
- Hero com imagem maior e link para o produto também na imagem.
- Busca com debounce, cancelamento de consultas anteriores, navegação por teclado, cinco sugestões e “Ver mais +” com filtro aplicado no catálogo. Busca normalizada por acentos e caixa.
- Ordenação “Menor preço” e “Maior preço”.
- Seleção de variante compartilhada com a galeria; imagens específicas vêm das associações cadastradas no Medusa, sem inventar cores.
- Painel próprio com autenticação administrativa nativa do Medusa e lista permitida no servidor. Um token de cliente não autoriza APIs administrativas.
- Produtos: cadastro offline, edição de conteúdo, imagens, categorias, opções, variantes, preços, publicação e remoção com confirmação. As operações financeiras permanecem bloqueadas no catálogo operacional até a correção monetária.
- Categorias: criação, edição e remoção; categorias com produtos não podem ser removidas pelo painel.
- Estoque físico e reservado por localização, ajuste de quantidade e avisos visuais de estoque baixo/esgotado com imagem.
- Pedidos: lista por últimas 24 horas, últimos sete dias ou todos; detalhes do cliente em modal e avanço logístico pelos workflows nativos. Não há botão para inventar pagamento aprovado.
- Atualização por polling a cada 15 segundos nos pedidos do cliente e nos recursos do lojista. Não é WebSocket nem garantia de atualização instantânea.
- OAuth Google: início e callback no servidor, cookie de estado, validação de estado, perfil nativo Medusa e cookie HttpOnly. Ainda não homologado com credenciais reais.
- E-mails de pedido: provider Resend no backend, assinantes dos eventos de pedido recebido, processamento, despacho e entrega; chave de idempotência, registro nativo de notificações e lock. Não envia sem configuração. Despachos/entregas parciais não são apresentados no e-mail como conclusão de todo o pedido.

## Validação

- TypeScript do frontend e backend.
- Testes unitários de busca, cores, disponibilidade, validação de endereço/checkout, CSRF e ciclo de carrinho.
- Teste de vitrine desktop/mobile contra leitura do catálogo: 95 produtos, foco, cinco sugestões, links, hero, filtros, ordenação, footer e proteção administrativa.
- Integração em banco isolado: autenticação nativa, categoria/produto/variante, valores BRL em unidades principais, estoque, conflito de atualização, publicação e recusa de token de cliente.
- Integração cliente/carrinho em banco isolado: duas contas, isolamento, endereços, perfil, pedidos, estoque e remoção de carrinho. Nenhuma cobrança criada.
- Os fixtures e produtos temporários usados pelo teste administrativo pertencem apenas ao banco local de testes; os produtos/categorias criados pelo teste são removidos ao terminar.

## Bloqueios antes da operação real

1. **Preços:** o catálogo importado está em escala centesimal, enquanto Medusa 2 trabalha em unidades principais. A vitrine antiga compensa dividindo por 100. Reconciliar os 95 produtos com o PDF e corrigir backend, carrinho, JSON-LD e formatação juntos. `MEDUSA_PRICES_VERIFIED=true` só pode ser habilitado depois dessa migração validada; não habilitar para contornar o bloqueio.
2. **Google:** configurar client ID, secret e callback no Medusa e no console Google; homologar conta nova, existente, cancelamento, expiração e rejeição de acesso administrativo por fluxo de cliente.
3. **Resend:** domínio/remetente verificados e credenciais exclusivamente no servidor. Deploy do provider/subscriber na VPS, teste de recebimento, falha/reenvio e duplicidade. O commit do backend não publica automaticamente a VPS. A presença de uma chave não prova entrega de e-mail.
4. **Autenticação por e-mail:** concluir endurecimento do código de cadastro (segredo obrigatório, tentativas persistidas, expiração e reenvio). Não confundir OAuth preparado com cadastro por e-mail homologado.
5. **Pedidos e pagamento:** testar pedido capturado, reserva, baixa física no fulfillment, despacho, entrega, cancelamento e reembolso ponta a ponta; configurar frete/provedor antes de abrir checkout real. O teste desta etapa não comprova uma venda paga.
6. **Concorrência:** o painel rejeita valores antigos nas edições, mas a comparação no BFF não é uma transação atômica. Homologar ajuste de estoque concorrente com reservas/fulfillment e aplicar controle transacional no backend antes de múltiplos operadores.
7. **Imagens:** homologar upload/download e persistência no volume/storage da VPS, incluindo imagens por variante e política de limpeza de uploads abandonados.
8. **Produção:** validar allowlist `MEDUSA_MERCHANT_EMAILS` no ambiente Vercel, configuração do backend, filas/event bus Redis com retry, observabilidade e rollback. Não inferir que configurações locais já estão publicadas.

## Arquivo de marca

Arquivo: `public/silva-moveis-logo-transparent.png` (RGBA, 1465 × 1074). Gerado a partir de `public/silva-moveis-logo-original.png`, com instrução para remover somente o fundo claro, inclusive nos vazios das letras, manter os traços dourados SM, sem redesenhar e com transparência real. O original foi preservado.

## Referências de implementação

- [Eventos e subscribers do Medusa](https://docs.medusajs.com/learn/fundamentals/events-and-subscribers)
- [Notificações do Medusa](https://docs.medusajs.com/resources/infrastructure-modules/notification/send-notification)

Os testes de integração usam exclusivamente `localhost:9010` e `localhost:3001`. O frontend de acompanhamento continua em `localhost:3000`.
