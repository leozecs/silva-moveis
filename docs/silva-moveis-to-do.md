# Silva Móveis — To-do list

Data: 24/09/2026.

Este documento registra a implementação solicitada. Itens marcados foram implementados ou verificados nesta etapa; itens abertos ainda precisam de trabalho ou confirmação. Ele complementa, sem substituir, o [checklist de operação do ecommerce](checklist-operacao-ecommerce.md). O guia do ecommerce continua sendo a referência de validação.

## 1. Logo original

- [x] Localizar e confirmar o arquivo oficial da logo da Silva Móveis.
- [x] Substituir a logo provisória sem distorcer proporções ou perder legibilidade.
- [x] Validar a apresentação no desktop e no mobile.

Aceite: a identidade original aparece corretamente nos locais em que a marca é exibida.

## 2. Busca sem perda de foco

- [x] Reproduzir o problema de perder o foco/fechar o teclado após digitar uma letra.
- [x] Identificar e corrigir a causa, verificando remontagem do campo, atualizações de estado e navegação.
- [x] Manter texto, cursor e foco durante a busca e a atualização dos resultados.
- [ ] Validar digitação contínua, exclusão, acentos e busca sem resultados no desktop e no mobile.

Aceite: é possível digitar uma pesquisa completa sem clicar novamente no campo ou reabrir o teclado.

## 3. Hero com três produtos

- [x] Selecionar três produtos aleatórios publicados e disponíveis para exibição no Medusa, sem dados mockados.
- [x] Manter a seleção estável durante a visita, sem sortear novamente a cada renderização.
- [x] Exibir imagem, nome, preço da vitrine e link para cada produto. A correção da escala monetária do backend permanece pendente, conforme a seção 4.
- [x] Alternar os produtos a cada 3 segundos.
- [x] Adicionar navegação manual e controle de pausa, respeitando acessibilidade e preferência por movimento reduzido.
- [ ] Tratar catálogos com menos de três produtos elegíveis e falhas no carregamento.

Aceite: três produtos reais alternam no tempo solicitado, com informações e links correspondentes.

## 4. Completar o catálogo 2026

Fonte: `02 CATÁLOGO SILVA MÓVEIS 2026.pdf`, fornecido pelo usuário.

- [ ] Comparar todos os itens do PDF com os produtos existentes no Medusa.
- [ ] Registrar os itens pendentes, duplicados e divergentes antes da importação.
- [ ] Cadastrar os produtos faltantes com nome, referência, descrição, preço e imagem correspondentes ao PDF.
- [ ] Conferir visualmente a associação entre imagem e produto; não inferir preços ou características ausentes.
- [ ] Reconciliar a divergência de escala monetária já identificada e corrigir dados e frontend de forma coordenada.
- [ ] Aplicar estoque inicial de 10 unidades aos novos produtos, conforme a orientação anterior. Para variantes, confirmar a distribuição por SKU sem multiplicar o estoque silenciosamente.
- [ ] Preservar estoque operacional dos produtos existentes e evitar duplicação ao repetir a importação.
- [ ] Entregar a relação de itens importados e de qualquer informação que ainda dependa de confirmação.

Aceite: todos os itens identificáveis do catálogo estão cadastrados corretamente; exceções ficam documentadas, nunca preenchidas com dados inventados.

## 5. Categorias e filtros de produtos

- [x] Remover a seção independente de categorias da página, preservando os filtros dentro da seção de produtos.
- [x] Definir categorias por tipo de produto com base no catálogo.
- [x] Criar ou ajustar as categorias no Medusa e vincular cada produto corretamente.
- [x] Consumir as categorias do Medusa no frontend.
- [x] Garantir que cada filtro retorne somente os produtos correspondentes.
- [x] Abaixo das categorias, adicionar um controle deslizante com marcador circular para o preço máximo.
- [x] Mostrar o limite selecionado em BRL e permitir operação por teclado.
- [x] Acima dos produtos, à direita, junto à contagem de resultados, adicionar botão com ícone de filtro/ordenação.
- [x] Oferecer as opções “Do mais caro para o mais barato” e “Do mais barato para o mais caro”.
- [x] Aplicar categoria, preço máximo e ordenação ao conjunto completo de resultados, não apenas à página já carregada.
- [ ] Atualizar contagem, paginação e estado vazio conforme os filtros; permitir limpar a seleção.

Aceite: filtros combinados e ordenação retornam produtos corretos, com preços e contagem consistentes.

## 6. Header e footer

- [x] Manter a header fixa durante a rolagem, sem cobrir o conteúdo.
- [x] Exibir o footer somente na home; não exibir no carrinho, recuperação de senha ou demais telas.
- [x] Implementar o footer preso ao rodapé da janela, somente na home, em formato compacto com menu de políticas.
- [ ] Implementar o comportamento confirmado sem sobrepor produtos, botões, campos ou teclado virtual.
- [ ] Validar desktop, mobile e áreas seguras da tela.

Aceite: header permanece acessível; footer aparece exclusivamente na home, no comportamento combinado.

## 7. Dropdown e acesso à conta

- [x] Remover “Home” do dropdown da header.
- [x] Remover “Carrinho” do dropdown, preservando o botão próprio do carrinho.
- [x] Remover “Lojista (preview)” e “Painel admin” do dropdown.
- [x] Quando deslogado, manter o acesso à autenticação.
- [x] Quando logado, mostrar apenas “Minha Conta” no botão da header.
- [ ] Confirmar a lista exata de e-mails autorizados como lojistas antes de atribuir permissões.
- [x] Vincular os lojistas autorizados a identidades e permissões verificadas no backend.
- [x] Direcionar lojistas autenticados ao painel do lojista e demais clientes ao painel do cliente.
- [x] Proteger páginas e APIs administrativas; não usar apenas comparação de e-mail no frontend para conceder acesso.
- [ ] Validar login de cliente, login de lojista, acesso direto não autorizado e logout.

Aceite: o destino de “Minha Conta” corresponde à identidade autenticada; clientes não conseguem acessar recursos administrativos.

## 8. Resend: cadastro e recuperação de senha

- [ ] Verificar domínio remetente e configurar os registros DNS exigidos pelo Resend.
- [ ] Configurar credenciais exclusivamente no servidor, sem incluir segredos no Git ou no frontend.
- [ ] Integrar o envio de e-mails ao fluxo de autenticação do Medusa.
- [ ] Implementar confirmação de cadastro por código de 6 dígitos.
- [ ] Definir expiração, limite de tentativas, intervalo de reenvio e invalidação dos códigos usados ou substituídos.
- [ ] Armazenar códigos de forma segura e impedir sua exposição em logs.
- [ ] Implementar solicitação de recuperação, envio e redefinição de senha com token seguro, temporário e de uso único.
- [ ] Evitar revelar se um e-mail está cadastrado na recuperação de senha.
- [ ] Concluir os estados de login/cadastro: pendente de confirmação, sucesso, erro, expiração e reenvio.
- [ ] Validar os fluxos com entrega real de e-mail e tratamento de falhas do provedor.

Aceite: cadastro pode ser confirmado por código; recuperação permite alterar a senha com segurança; login usa autenticação real do backend. Google OAuth e cobrança real do Mercado Pago não fazem parte desta lista.

## 9. Variantes de cor e galeria

- [ ] Conferir e cadastrar opções de cor e variantes de cada produto no Medusa.
- [x] Definir identificação visual das cores sem inventar opções não cadastradas pelo lojista.
- [x] Abaixo do preço, exibir bolinhas somente para as cores cadastradas naquele produto.
- [ ] Associar cada seleção à variante correta, incluindo preço, estoque e imagem quando disponíveis.
- [ ] Exibir nome acessível, indicação da cor selecionada e indisponibilidade quando aplicável.
- [x] Adicionar ao carrinho exatamente a variante escolhida.
- [x] Para produtos com duas ou mais imagens, mostrar uma galeria de miniaturas abaixo da imagem principal.
- [x] Permitir trocar a imagem principal pelas miniaturas, com navegação acessível e comportamento responsivo.
- [x] Não exibir galeria redundante para produtos com apenas uma imagem.

Aceite: as cores refletem exclusivamente o cadastro do produto; seleção, imagem, preço, estoque e variante do carrinho permanecem consistentes.

## 10. Validação e entrega desta etapa

- [ ] Validar cada item contra o guia do ecommerce e registrar evidências de teste.
- [ ] Executar testes de tipos, lint e testes automatizados aplicáveis.
- [ ] Testar desktop e mobile, incluindo busca, filtros, carrossel, autenticação e seleção de variantes.
- [ ] Verificar que nenhuma mudança regrediu carrinho, checkout ou permissões existentes.
- [ ] Atualizar este checklist separando implementação, teste integrado e validação em produção.
- [ ] Preparar resumo das alterações e das pendências antes de combinar publicação.

## Informações necessárias antes das tarefas correspondentes

- Arquivo confirmado da logo original.
- Lista exata dos e-mails de lojistas autorizados.
- Definição do comportamento de footer fixo na home.
- Acesso ao Resend, domínio remetente e DNS, por meios seguros.
- Cores e imagens das variantes que não estiverem documentadas no catálogo ou no Medusa.

As pendências anteriores de checkout, pagamento de teste, reserva de estoque, operação administrativa e ciclo de pedidos continuam no checklist operacional. Este documento não as declara concluídas.

## Resultado desta implementação

- Logo original extraída do elemento de imagem da capa do PDF, sem redesenho.
- Busca corrigida ao retirar o componente de formulário de dentro do componente da header.
- Vitrine passou de 24 para os 95 produtos existentes. Não foram criadas duplicatas: os SKUs SM-001 a SM-095 já estavam no Medusa. Isso não confirma todas as alternativas de composição/preço citadas dentro de cada página do PDF.
- Criadas 17 categorias de tipo no Medusa de produção; os 95 produtos foram vinculados. Categorias anteriores, preços e estoque foram preservados.
- Corrigido carregamento das fotos que apontavam para o hostname antigo da Vercel. Os arquivos correspondentes já estão versionados em public/catalog-images.
- Footer fixo compacto exclusivo da home; header permanece visível durante a rolagem.
- Login de lojista implementado com autenticação de ator administrativo do Medusa, verificação de /admin/users/me e lista de e-mails no servidor. O e-mail anteriormente informado, leocodes.dev@gmail.com, foi configurado apenas no ambiente local. O painel mostra contagens reais e links para a gestão nativa, que mantém sua própria autenticação.
- Estrutura de bolinhas de cor consome apenas a opção Cor/Color/Colour cadastrada no produto. O valor visual aceita metadata.hex na opção ou metadata.color_hex na variante. Sem cor visual cadastrada, o nome aparece com marcador neutro; não é inventado um tom.
- Galeria mostra miniaturas quando existem duas ou mais imagens; ampliação agora funciona em um diálogo.

### Testes executados

- TypeScript do frontend: aprovado.
- 13 testes unitários: aprovados.
- Navegador desktop e mobile: 95 produtos, busca sem perda de foco, três slides com rotação, imagem da hero carregada, menu, filtro Banquetas com nove resultados, preço máximo, ordenação, footer e bloqueio do admin deslogado.
- Login administrativo real no frontend local: identidade de lojista, contagens do Medusa, link Minha Conta, redirecionamento e logout aprovados.
- Comandos reproduzíveis: tests/storefront-browser.mjs e tests/merchant-login-smoke.mjs. Este último recebe a senha sem eco no terminal e não a grava.

### Ainda não concluído

- Ativação do Resend: faltam credencial e remetente/domínio verificado no ambiente; nenhum e-mail real foi enviado nesta etapa. O fluxo atual de código ainda precisa de revisão de segurança, limite persistente de tentativas e validação ponta a ponta antes de ser considerado pronto.
- Cores e fotografias específicas por variante: os produtos existentes têm somente Modelo: Padrão. O catálogo geral de cores não comprova disponibilidade de cada cor para cada produto.
- Conferência de todas as alternativas de composição e preços internos do PDF e correção coordenada da escala monetária anterior.
- Publicação das alterações de frontend e variáveis correspondentes na Vercel: não realizada. A vinculação de categorias no Medusa é a alteração feita em produção nesta etapa.
- Outras pendências do checklist operacional anterior continuam abertas.
