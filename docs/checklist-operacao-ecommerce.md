# Checklist de implementação: checkout e operação Silva Móveis

Auditoria: 23/09/2026. Base de código: `796e232`. Backend declarado: Medusa 2.20.1.

Escopo desta entrega: inspeção do código-fonte e planejamento. Não foram executados pedidos, cobranças, alterações de estoque, deploys ou testes na VPS. Recursos nativos instalados não equivalem a configuração produtiva validada. Não há suíte de testes de negócio localizada no código-fonte; scripts de teste do backend, sozinhos, não constituem evidência.

Referência: Guia do E-commerce Alpha Design, edição 1.0, especialmente capítulos 09, 14, 16, 17, 19, 20, 25, 26, 27, 29, 30 e 33. Aplicar os contratos à Silva, preservando sua estrutura; não copiar nomes de rotas ou convenções monetárias da Alpha sem verificar.

Legenda: `[x]` existe no código, sem certificar produção; `[ ]` falta implementar ou validar. “Parcial” significa que há uma base utilizável, mas o capítulo não passou pelo aceite.

## Visão geral

| Capítulo | Situação no repositório | Principal pendência |
| --- | --- | --- |
| 1. Checkout | Parcial: formulário, ViaCEP, resumo e atualização de carrinho | Endereço completo, revisão, cupom, termos e conclusão |
| 2. Frete | Parcial: consulta e inclusão de opção | Seleção explícita e política comercial; configuração adiada |
| 3. Seleção de pagamento | Não implementada | Cartão de crédito, Pix e boleto com persistência |
| 4. Backend de pagamento | Parcial: rotas de collection/session/complete e plugin condicional | Contrato seguro de tentativa e ambiente sem cobrança |
| 5. Estoque | Base nativa Medusa; integração visual e reserva temporária ausentes | Disponibilidade, bloqueio e ciclo de reserva |
| 6. Minha conta | Parcial: identidade e logout; demais blocos informativos | Pedidos, endereços e edição de perfil |
| 7. Admin | `/admin` do front é informativo; dashboard Medusa declarado como dependência | Validar Admin real e operação autorizada |
| 8. Fluxo de pedido | Não implementado na aplicação da loja | Projeção de estados, transições e histórico |

Nenhum dos oito capítulos está encerrado de ponta a ponta nesta auditoria.

## Prioridades transversais antes de finalizar uma venda

- [ ] **BASE-01 — Confirmar unidade monetária.** Confrontar um preço conhecido do catálogo com variante, carrinho e pedido Medusa. `src/lib/cart.ts`, `src/lib/medusa.ts` e o schema em `src/app/produto/[slug]/page.tsx` dividem valores por 100. Medusa v2 usa unidade principal: verificar se a importação também aplicou conversão indevida antes de corrigir a exibição. Não alterar preços em massa sem reconciliação. Aceite: R$ 50,00 cadastrado permanece R$ 50,00 em todas as fronteiras; testar também R$ 50,90 e desconto.
- [ ] **BASE-02 — Definir identidade do checkout.** O guia propõe carrinho autenticado, mas a rota atual permite criação sem token. Adotar checkout autenticado como proposta inicial ou documentar suporte seguro a visitante. Resolver dono pelo servidor; validar acesso a carrinho, linha, collection, sessão e pedido. Não aceitar `customer_id` arbitrário do browser. Aceite: cliente A não lê/altera dados de B.
- [ ] **BASE-03 — Fortalecer o adapter HTTP.** Em `src/app/api/cart/route.ts`, usar schemas por ação, campos permitidos, validação de quantidade/IDs, origem/CSRF nas mutações com cookie, timeout e tradução de erros 400/401/403/409/503. Hoje todos os erros capturados viram 502 e mensagens brutas do backend podem chegar à UI.
- [ ] **BASE-04 — Preservar carrinho em falhas.** Em `src/components/cart-provider.tsx`, parar de apagar `silva_cart_id` em qualquer erro de leitura. Distinguir indisponibilidade, ausência e conclusão. Serializar mutações na UI, proteger criação concorrente no backend e descartar respostas de sessão antiga. Aceite: 503, duas abas e troca de usuário não perdem nem misturam carrinhos.
- [ ] **BASE-05 — Validar ambiente comercial.** Confirmar Brasil/BRL, canal, publishable key, localização, variantes, preços e vínculos de estoque no backend em execução. Conferir qual SHA está publicado antes de atribuir à produção o estado deste checklist.

## 1. Checkout

Evidências: `src/app/checkout/page.tsx`, `src/app/api/cart/route.ts`, `src/lib/cart.ts`, `src/app/termos-de-uso/page.tsx`.

- [x] Campos de e-mail, nome, sobrenome, telefone, endereço, cidade, UF e CEP.
- [x] Consulta ViaCEP após oito dígitos, com mensagens de consulta/erro.
- [x] Envio de e-mail e endereços de entrega/cobrança para o carrinho Medusa.
- [x] Resumo simples de itens, quantidades e total retornado pelo backend.
- [x] Página de termos disponível.
- [ ] Endereço estruturado completo, revisão final, cupons e aceite persistido.
- [ ] Conclusão do checkout: a tela termina em “Entrega selecionada”; não chama o fluxo de pagamento/conclusão.

Tarefas:

- [ ] **CHK-01 — Separar as etapas e recuperar os dados.** Organizar identificação, endereço, revisão e método. Inicializar campos com carrinho/perfil autenticado; preservar ao voltar/recarregar. Aceite: nenhuma etapa apaga os dados já salvos.
- [ ] **CHK-02 — Validar dados pessoais.** Validar e-mail e telefone no cliente/servidor, ligar labels aos inputs e mostrar erro por campo. Definir contrato para documento fiscal/pagador quando necessário ao método; não criar campo sem finalidade. Aceite: payload inválido também é rejeitado por chamada direta à API.
- [ ] **CHK-03 — Completar endereço.** Separar rua, número, complemento opcional, bairro, cidade, UF, CEP e país. Acordar onde número/bairro serão persistidos e lidos pela operação; hoje rua e bairro são concatenados. Permitir endereço de cobrança diferente. Aceite: todos os campos retornam corretamente após salvar.
- [ ] **CHK-04 — Robustecer CEP.** Colocar CEP antes da rua; aceitar colagem com hífen, máscara e oito dígitos normalizados. Cancelar/ignorar resposta de consulta antiga, aplicar timeout, validar resposta HTTP e permitir correção manual. Aceite: CEP inválido, genérico, indisponível e troca rápida entre dois CEPs não produzem endereço incorreto.
- [ ] **CHK-05 — Revisar compra.** Mostrar variante, quantidade, preço unitário, subtotal, descontos, frete e total oficiais, além de endereço e método. Revalidar no servidor antes da próxima ação. Aceite: alteração de preço/estoque produz aviso e revisão, nunca aprovação silenciosa.
- [ ] **CHK-06 — Integrar cupons.** Criar adicionar/remover código usando promoções nativas do carrinho; renderizar valores devolvidos pela Medusa. Validar validade, mínimo, elegibilidade e combinação no backend. Aceite: cupom válido, expirado, inválido e removido recalculam corretamente, inclusive sob duas requisições.
- [ ] **CHK-07 — Persistir aceite.** Checkbox desmarcado, links de termos e política, validação no servidor e registro da versão/data vinculados ao checkout e preservados no pedido. Não misturar com consentimento de marketing. Aceite: ausência/forja de aceite não conclui checkout.
- [ ] **CHK-08 — Confirmação recuperável.** Quando o fluxo permitir criar pedido, retornar ID oficial, exibir página autorizada de confirmação e invalidar somente o carrinho concluído. Enquanto não houver pagamento real, usar apenas ambiente de teste e mensagens explícitas. Aceite: reload e repetição não criam outro pedido.

## 2. Frete independente de pagamento

Evidências: ações `shipping_options`/`add_shipping` no adapter; `submit` do checkout.

- [x] Consulta opções por carrinho e envia uma opção para a Medusa.
- [ ] Tela para escolher opção, preço e prazo.
- [ ] Política comercial configurada/validada.

Hoje a primeira opção é selecionada automaticamente; sem opções, o checkout para. Isso não prova que frete está pronto.

Tarefas:

- [ ] **SHP-01 — Separar salvar dados de selecionar frete.** Salvar endereço sem criar sessão de pagamento. A UI deve representar “frete pendente de configuração/cotação”. Aceite: endereço pode ser salvo sem gateway.
- [ ] **SHP-02 — Preparar contrato de cotação.** Tipar ID, preço, moeda, prazo, elegibilidade e contexto de endereço/carrinho; listar opções reais e exigir escolha. Aceite: nenhuma seleção automática escondida.
- [ ] **SHP-03 — Configurar operação depois.** Quando a política for definida, ajustar shipping profile, location, fulfillment provider, service zone, opções e cobertura no Admin. Não inventar frete grátis ou prazo.
- [ ] **SHP-04 — Invalidar cotação desatualizada.** Troca de CEP, endereço ou composição deve revalidar frete e total. Aceite: opção de outro contexto não pode ser reaproveitada.
- [ ] **SHP-05 — Bloquear cobrança incompleta.** Enquanto o negócio exigir cotação e ela não existir, manter checkout em preparação. Retirada ou frete cobrado separadamente dependem de regra explícita. Aceite: total sem frete não é apresentado como compra final pronta.

## 3. Seleção visual: crédito, Pix e boleto

Evidência: a página de checkout não contém seletor de pagamento.

- [ ] **UI-PAY-01 — Criar grupo de opções acessível.** Cartão de crédito, Pix e boleto com seleção por teclado, foco, ícone e texto claros. Não incluir débito, taxas ou parcelas ainda não configuradas.
- [ ] **UI-PAY-02 — Persistir preferência.** Validar enum no servidor e recuperar ao voltar/recarregar. Selecionar método não deve iniciar cobrança.
- [ ] **UI-PAY-03 — Separar preferência de disponibilidade.** Em desenvolvimento, mostrar modo de teste; produção não deve anunciar emissão real antes da habilitação. Não gerar QR Pix, linha digitável nem formulário de cartão reais nesta etapa.
- [ ] **UI-PAY-04 — Tratar mudança de método.** Se houver tentativa ativa, cancelar/resolver sua condição antes de abrir outra, preservando idempotência. Aceite: alternar método não duplica tentativa nem perde formulário.

## 4. Estrutura de pagamento no backend sem cobrança real

Evidências: `src/app/api/cart/route.ts`, `apps/backend/medusa-config.ts`, `apps/backend/package.json`. As pastas customizadas de workflows, jobs e módulos contêm apenas documentação de scaffold.

- [x] Adapter expõe criação de payment collection, payment session e conclusão de carrinho.
- [x] Dependência Mercado Pago 0.3.0 declarada; plugin/provider condicionados à presença de token.
- [ ] Tentativa durável própria, proteção de propriedade, deduplicação, reconciliação e testes sem cobrança.
- [ ] Compatibilidade do plugin com os três métodos brasileiros e Orders API exigida pelo guia validada.

Tarefas:

- [ ] **PAY-01 — Fixar contrato de integração.** Conferir tipos da versão instalada e inspecionar o plugin. Documentar se atende Mercado Pago Orders API, crédito, Pix, boleto e webhooks; substituir/adaptar somente se necessário. Dependência instalada não comprova compatibilidade.
- [ ] **PAY-02 — Criar ambiente de teste isolado.** Implementar provider/adapter determinístico de teste, explicitamente desabilitado em produção e sem chamadas ao gateway. Simulações autorizadas/capturadas são apenas fixtures de teste, não evidências financeiras reais. Aceite: nenhuma requisição externa nem credencial produtiva necessária.
- [ ] **PAY-03 — Persistir intenção.** Reutilizar entidades Medusa de collection/session; módulo próprio apenas para lacunas como tentativa, chave idempotente, fingerprint econômico, método, expiração e vínculo do ator. Criar migration somente para novos modelos/índices/links. Não duplicar tabelas nativas de pedidos/pagamentos.
- [ ] **PAY-04 — Revalidar antes de iniciar.** Ler carrinho oficial, dono, moeda, totais, cupom, frete, termos e estoque. Escolher provider permitido no servidor; não confiar no `provider_id` livre recebido atualmente. Aceite: manipular total/provider/collection de outro cliente falha.
- [ ] **PAY-05 — Garantir idempotência.** Chave estável por intenção, restrição única e lock compartilhado com mutações econômicas. Repetição recupera tentativa; payload diferente com mesma chave gera conflito. Aceite: dois cliques/abas não duplicam tentativa/conclusão.
- [ ] **PAY-06 — Implementar estados recuperáveis.** Pendente, recusado, cancelado, expirado e desconhecido após timeout; status consultável com autorização. Um reconciliador comum servirá futura notificação, consulta e job. Aceite: queda após persistência retoma sem perder vínculo.
- [ ] **PAY-07 — Validar conclusão Medusa.** Tratar respostas discriminadas de sucesso/erro de `complete`, preservar contexto pendente e gerar no máximo um pedido. Verificar em teste se o workflow exige autorização; não fingir autorização para criar pedido pendente em produção.
- [ ] **PAY-08 — Preparar ativação futura.** Documentar payload por método, tokenização do cartão no provedor, assinatura de webhook, reconciliação, cancelamento e reembolso. Não armazenar PAN/CVV, nem marcar pago a partir da UI.

Aceite do capítulo nesta fase: contratos e simulações comprovados no ambiente isolado. A operação financeira real continua pendente até homologação específica do gateway.

## 5. Estoque

Evidências: `StorefrontVariant` não inclui inventário; produto desabilita compra somente por ausência de preço/variante. JSON-LD publica `InStock` sempre que existe preço. Não há workflow/job customizado de reserva no fonte.

- [ ] Disponibilidade real na vitrine e produto.
- [ ] Bloqueio frontend e validação efetiva no backend demonstrados.
- [ ] Reserva temporária ao iniciar checkout demonstrada.

A Medusa reserva itens ao concluir o carrinho em pedido. Isso é diferente da reserva temporária antes da conclusão solicitada aqui.

Tarefas:

- [ ] **INV-01 — Auditar inventário por SKU.** Conferir `manage_inventory`, `allow_backorder`, níveis, localização e canal. Validar o saldo real; não repor automaticamente 10 unidades por causa da instrução histórica de importação.
- [ ] **INV-02 — Exibir disponibilidade.** Buscar campos adequados da variante, mostrar disponível/esgotado e desabilitar compra quando aplicável. Corrigir também o JSON-LD e selecionar a variante correta quando houver opções.
- [ ] **INV-03 — Validar quantidade no servidor.** Revalidar ao adicionar, alterar e iniciar checkout. Limitar quantidade na UI e traduzir conflitos. Aceite: chamada direta acima do saldo é rejeitada e última unidade não vende duas vezes.
- [ ] **INV-04 — Projetar reserva temporária.** Vincular tentativa/carrinho, item, quantidade, localização, dono e expiração usando módulos/workflows Medusa. Proposta: reservar ao validar o checkout para iniciar tentativa, não ao simplesmente abrir a página. Prazo depende da política por método e deve ficar configurável.
- [ ] **INV-05 — Implementar ciclo de vida.** Reconciliar reserva temporária com a nativa na conclusão sem contagem dupla/janela desprotegida. Liberar uma vez em cancelamento/recusa, reconciliar antes de expirar e preservar em estado desconhecido. Registrar política de pagamento tardio.
- [ ] **INV-06 — Criar job e testes concorrentes.** Job em lotes com locks, expiração indexada, retry e diagnóstico de órfãs. Aceite: dois clientes disputam uma unidade; repetir cancelamento/liberação não gera saldo incorreto; reinício não perde reservas.

## 6. Minha conta

Evidências: `src/app/minha-conta/page.tsx`, `src/lib/medusa.ts`, `src/components/customer-logout-button.tsx`, `src/app/api/auth/logout/route.ts`.

- [x] Busca `/store/customers/me` com token em cookie HttpOnly e exibe nome/e-mail.
- [x] Logout remove cookie da aplicação e redireciona para acesso.
- [ ] Pedidos: existe somente texto “Seus pedidos aparecerão aqui”.
- [ ] Endereços: não há CRUD na aplicação.
- [ ] Dados pessoais: não há formulário de edição.

Tarefas:

- [ ] **ACC-01 — Proteger sessão e carregamentos.** Requerer identidade validada para dados privados; diferenciar 401 de 503. Hoje `getStorefrontCustomer` devolve `null` para ambos. Dados de pedidos/perfil/endereço devem carregar com erros independentes.
- [ ] **ACC-02 — Listar/detalhar pedidos.** Consumir Store API autenticada com paginação, estados vazios/erro, número, data, total, itens e estados. Consultar snapshots do pedido, não catálogo atual. Aceite: conta A não acessa pedido B por URL/ID.
- [ ] **ACC-03 — CRUD de endereços.** Listar, criar, editar, excluir e escolher padrão usando APIs de customer; reutilizar validação/CEP do checkout. Aceite: editar perfil não altera endereço histórico do pedido.
- [ ] **ACC-04 — Editar perfil.** Nome, sobrenome e telefone com allowlist no servidor. E-mail somente leitura até existir fluxo de alteração verificado e sincronizado com a identidade. Aceite: salvar/recarregar reflete backend e não permite trocar ID/dono.
- [ ] **ACC-05 — Completar logout.** Tratar erro HTTP, limpar PII/cache e contexto do carrinho da conta, invalidar outras abas. Definir estratégia de revogação de sessão/token quando necessária; apagar cookie não revoga JWT copiado. Aceite: logout/login em outra conta não exibe dados antigos.
- [ ] **ACC-06 — Integrar conta e checkout.** Pré-preencher dados e oferecer endereço salvo, sem sobrescrever formulário em edição. Respostas da sessão anterior não podem atualizar a nova.

## 7. Painel administrativo

Evidências: `src/app/admin/page.tsx` é página estática sem ações nem autenticação de lojista. `apps/backend/package.json` declara dashboard Medusa; isso não prova acesso, configuração ou autorização no servidor atual.

Proposta: usar o Admin nativo Medusa para produtos/clientes/inventário/pedidos e estender apenas lacunas operacionais. Evitar construir um segundo admin completo.

- [ ] **ADM-01 — Validar Admin real.** Confirmar URL configurada na Silva, login administrativo, persistência e versão em execução; ajustar atalho `/admin`. Não assumir a rota `/medusa-admin` da Alpha.
- [ ] **ADM-02 — Validar permissões.** Usuários individuais, ações permitidas por função e bloqueio no backend; verificar capacidades da versão instalada e estender autorização se faltar granularidade. Aceite: cliente/atendente sem permissão não modifica estoque nem estado financeiro.
- [ ] **ADM-03 — Pedidos.** Validar lista, filtros, paginação, detalhe, endereços, itens, pagamento e cancelamento com pedido de teste. Não marcar pedido pago por clique genérico.
- [ ] **ADM-04 — Clientes.** Validar listagem, perfil, endereços e pedidos relacionados, com dados mínimos necessários à operação.
- [ ] **ADM-05 — Estoque.** Validar saldo físico/reservado/disponível, localização e ajustes rastreáveis por SKU; registrar motivo e responsável quando necessário.
- [ ] **ADM-06 — Produtos.** Validar criação/edição/publicação de produto, variante, preço BRL e imagem no canal da loja. Aceite: alteração aparece na Store API e no front com valores corretos.
- [ ] **ADM-07 — Ações operacionais.** Reaproveitar fulfillment nativo para preparar, despachar e entregar; estender UI/workflows se necessário. Registrar ator, data, estado anterior/novo e dados de rastreio quando existirem.
- [ ] **ADM-08 — Atualização e auditoria.** Reconsultar após ações; polling com backoff/pausa em aba oculta se necessário. Persistir histórico e impedir repetição de efeito por duplo clique.

## 8. Fluxo de pedido

Não existe mapper/timeline operacional da Silva no fonte. Os estados abaixo são uma projeção comercial proposta; não substituem os estados separados de pedido, pagamento e fulfillment Medusa.

| Estado na loja | Condição mínima | Tarefa |
| --- | --- | --- |
| Aguardando pagamento | Tentativa pendente; não assumir que já existe `order.id` | **ORD-01**: exibir checkout/tentativa pendente por ID autorizado; se o negócio exigir pedido antes do pagamento, desenhar esse fluxo explicitamente |
| Pago | Backend confirmou estado financeiro elegível e conclusão oficial | **ORD-02**: reconciliar e concluir uma vez; simulação somente em ambiente de teste |
| Preparando | Pedido elegível, não cancelado, ação autorizada | **ORD-03**: iniciar operação e registrar responsável/data |
| Enviado | Fulfillment despachado com confirmação operacional | **ORD-04**: registrar saída e rastreio quando houver |
| Entregue | Confirmação real da entrega | **ORD-05**: registrar entrega; `shipped` não equivale a entregue |
| Cancelado | Cancelamento permitido, com tratamento de pagamento/reserva | **ORD-06**: distinguir cancelamento de pendente, cancelamento comercial e reembolso de pago |

Tarefas complementares:

- [ ] **ORD-07 — Mapper único no backend.** Retornar estado de pagamento, pedido, entrega e ações permitidas. Usar a mesma regra para conta, admin, consulta e jobs; suportar pagamentos/entregas parciais sem rotular tudo como concluído.
- [ ] **ORD-08 — Histórico durável.** Registrar eventos, origem, data, ator e transição; consultar com paginação. Não sobrescrever histórico com único booleano ou metadata visual divergente do estado nativo.
- [ ] **ORD-09 — Proteger transições.** Pré-condições, ownership/RBAC, idempotência e locks. Aceite: não enviar pedido não pago, não entregar sem saída, não reaprovar evento antigo nem duplicar cancelamento.
- [ ] **ORD-10 — Recuperar falhas.** Pagamento confirmado sem pedido deve gerar pendência e retry, não segunda cobrança. Preparar eventos para notificações futuras sem depender do Resend nesta fase.

## Ordem de execução e dependências

1. BASE-01 a BASE-05: dinheiro, identidade, contratos, carrinho e configuração comercial.
2. CHK-01 a CHK-07 + SHP-01/02/04/05: checkout completo com frete explicitamente pendente; SHP-03 fica para a decisão posterior.
3. UI-PAY-01 a UI-PAY-04 + PAY-01 a PAY-06: seleção e estrutura de teste sem cobrança.
4. INV-01 a INV-06: disponibilidade e reservas integradas à tentativa; testar último item antes de permitir conclusão.
5. PAY-07 + CHK-08 + ORD-01 a ORD-10: conclusão de teste recuperável e estados oficiais.
6. ACC-01 a ACC-06: conta consumindo dados reais; perfil/endereços podem avançar em paralelo às etapas 3 e 4.
7. ADM-01 a ADM-08: validar operações nativas desde o início; fechar fluxo com pedido de teste até entrega/cancelamento.
8. Homologação integrada e registro de evidências. Ativação de frete comercial, gateway e e-mails é uma liberação posterior.

## Critérios de fechamento

- [ ] Registrar data, SHA do front/backend, ambiente, caso e resultado de cada teste.
- [ ] Jornada mobile e desktop: produto/variante -> carrinho -> dados -> CEP -> endereço -> cupom -> termos -> revisão -> método -> resultado de teste.
- [ ] Dois clientes: isolamento de carrinho, collection, pedido, perfil e endereço, inclusive chamadas diretas.
- [ ] Última unidade: concorrência, recusa, expiração, cancelamento e reexecução.
- [ ] Dois cliques/abas e timeout: uma intenção econômica e no máximo uma conclusão por carrinho.
- [ ] Falha de API preserva carrinho/formulário/sessão; recuperação reconsulta dados oficiais.
- [ ] Total idêntico em produto, carrinho, revisão, tentativa e pedido, com descontos/arredondamento comprovados.
- [ ] Admin percorre preparação, saída, entrega e cancelamento com permissões e histórico.
- [ ] Nenhum pagamento de teste é exposto como real; frete indefinido bloqueia a liberação comercial correspondente.

Esta lista fecha a preparação funcional solicitada. Não equivale a loja liberada para cobrar: homologação de gateway, política de entrega e demais gates operacionais do guia permanecem necessários.

## Fontes técnicas

- [Medusa v2: valores em unidade monetária principal](https://docs.medusajs.com/learn/fundamentals/data-models/big-numbers).
- [Medusa: ciclo de reservas nativas](https://docs.medusajs.com/resources/commerce-modules/inventory/reservations-lifecycle).
- Guia local: `guia-do-ecommerce-alpha-design.pdf`, edição 1.0, 20/09/2026; páginas 13, 18, 20–24, 29–31, 33–34 e 37–38.
