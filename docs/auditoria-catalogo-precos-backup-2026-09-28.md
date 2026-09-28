# Auditoria do catálogo, preços e backup — 28/09/2026

## Resultado comprovado

- [x] As 95 referências principais do PDF Silva Móveis 2026 (01–95, páginas 4–98) existem no Medusa, como SKUs SM-001–SM-095. Não há referência principal ausente na exportação auditada.
- [x] Os 95 nomes correspondem aos títulos das respectivas páginas. Existem 95 produtos e 95 variantes; títulos iguais em páginas diferentes representam configurações distintas, identificadas pelo SKU/handle.
- [x] As 95 imagens foram comparadas visualmente com as fotos embutidas nas respectivas páginas. Todas mostram o item correto. Alguns arquivos ainda são recortes da página, com bordas, textos ou mais de uma foto; não foram substituídos nesta auditoria.
- [x] As 95 imagens respondem HTTP 200 e image/jpeg na VPS e na Vercel: 190 URLs verificadas.
- [x] Os 95 preços principais foram reconciliados com o maior tamanho de fonte contendo preço na página do PDF. Auditoria posterior à migração: 95 linhas, zero divergências.
- [x] A escala monetária foi corrigida no banco (amount e raw_amount) e nos formatadores do frontend/JSON-LD. O Medusa v2 usa unidades principais; 9300 representa R$ 9.300,00, não 930000.
- [x] Três carrinhos abertos foram reprecificados pelo workflow nativo refreshCartItemsWorkflow, com force_refresh. Dois tinham um item e total final 9300; um estava vazio. Zero divergências de preço de item de carrinho.
- [x] Frontend compatível publicado na VPS e promovido na Vercel. Health, produto, busca e JSON-LD públicos conferidos. Testes locais: 16 passaram; build Next.js passou.
- [x] Backups antes e depois da correção copiados para fora da VPS, cifrados e autenticados no Mac. Arquivo posterior contém dump, exportação de catálogo, arquivo de uploads e 95 fotos.
- [x] Restore do dump posterior em banco isolado: 95 produtos, 95 preços e 181 migrations. O dump extraído do arquivo externo cifrado tem exatamente o hash do dump restaurado.
- [ ] Upload na nuvem confirmado: a busca no Drive web por silva-20260928-db-images não encontrou o arquivo. A pasta local do Google Drive ainda não comprovou sincronização; envio direto aguarda autorização.
- [ ] Rotina automática, retenção externa, alerta de falha e cópia da chave de recuperação fora deste Mac. Um snapshot não é uma rotina de backup.

## Divergências corrigidas

O primeiro teste verificou se o valor aparecia em algum lugar da página; isso não era suficiente. A conferência pelo preço principal destacado encontrou três itens importados com o valor somente do balanço, embora o conjunto principal inclua suporte:

| SKU | Valor anterior exibido | Valor correto do conjunto | Composição |
| --- | ---: | ---: | --- |
| SM-052 | R$ 2.000,00 | R$ 3.250,00 | Balanço de fibra + suporte de R$ 1.250,00 |
| SM-053 | R$ 2.500,00 | R$ 3.750,00 | Balanço de corda náutica + suporte de R$ 1.250,00 |
| SM-054 | R$ 1.800,00 | R$ 3.050,00 | Balanço de fibra + suporte de R$ 1.250,00 |

Os três produtos receberam o subtítulo “Suporte incluso no valor anunciado.”. Preço e subtítulo foram conferidos publicamente nas duas lojas. Os demais 92 preços principais permaneceram equivalentes ao PDF, após normalização da escala.

## Limites do cadastro

- As 95 referências principais estão cadastradas. Isso **não** significa que todas as opções comerciais descritas no PDF estejam compráveis: há vidro opcional, conjuntos com número diferente de assentos, peças avulsas e materiais alternativos ainda não modelados como variantes.
- Páginas 99–101 são paletas gerais, não autorização para disponibilizar toda cor em todo produto. Nenhuma cor foi inventada nesta tarefa.
- SM-094 e SM-095 anunciam R$ 1.200,00 **por metro**. Não tratar esse valor como um pergolado completo. A descrição informa a unidade; venda por medida/projeto ainda exige fluxo específico antes de liberar checkout desses itens.
- Não foram homologados frete, pagamento real, estoque concorrente ou políticas comerciais nesta tarefa.

## Migração e releases

- Backup e evidências na VPS: /opt/silva-backups/catalog-audit-20260927/.
- Dry-runs: silva_price_audit_20260927 (normalização inicial) e silva_price_audit_20260928 (normalização e três preços com suporte). Bancos isolados mantidos; não são produção.
- Restore posterior: silva_backup_restore_20260928, também isolado.
- Migração transacional: ops/normalize-catalog-prices.sql. Guardas exigem 95 preços/SKUs, raw_amount equivalente, valores antigos esperados para os três balanços e ausência de payment sessions. Houve backup imediatamente anterior; rollback dos preços/subtítulos foi preparado.
- Reprecificação: apps/backend/src/scripts/reprice-open-carts.ts. A API e o frontend foram pausados brevemente; PostgreSQL, Redis e Caddy permaneceram ligados. Nenhum pagamento foi executado.
- Imagem nova do frontend: silva-web:price-20260928. Backend mantido em silva-medusa:ea2d87a.
- Vercel: dpl_6xbeyCEDgP4Gum1GdBQYdBhgZnft, READY, promovido a produção. URL imutável: https://crie-apenas-o-frontend-sem-backend-42ayjijm2.vercel.app.
- URLs públicas verificadas: https://2-25-218-128.sslip.io/ e https://silva-moveis.vercel.app/.
- MEDUSA_PRICES_VERIFIED=true no frontend da VPS. A variável persistente da Vercel não foi alterada nesta tarefa; sua edição administrativa de preço permanece protegida pelo gate anterior.
- Código desta rodada incluído no commit de correção monetária e auditoria. Não redeployar commits anteriores a esta correção: eles dividem preços por 100 e são incompatíveis com o banco corrigido.

## Backups externos e recuperação

Pasta no Mac: /Users/leo/Library/CloudStorage/GoogleDrive-leocodes.dev@gmail.com/Meu Drive/Silva Moveis/Backups/.

- silva-20260927-db-images.tar.gz.enc e .hmac: snapshot anterior à correção.
- silva-20260928-db-images.tar.gz.enc e .hmac: snapshot posterior. Inclui post-price.dump, post-price-catalog.psv, uploads.tar.gz e public/catalog-images/01.jpg–95.jpg. O volume uploads estava vazio no momento do backup; as fotos comerciais atuais pertencem ao frontend.
- Cifra: OpenSSL AES-256-CBC, salt, PBKDF2 com 200000 iterações. Encrypt-then-MAC: HMAC-SHA256 sobre o ciphertext, com chave derivada separadamente; verificar MAC antes de decriptar.
- Chave de recuperação no macOS Keychain: serviço silva-moveis-backup-20260927, conta leo. A chave não foi salva no Git nem na pasta do Drive. Precisa de cópia segura fora deste Mac para sobreviver à perda do computador; não enviar a chave junto com os backups.

Hashes SHA-256:

- Dump posterior: e6a28974c14b676fe2ec5ade983749300eaeba5950080798ff6cce538cda0bf8.
- Arquivo cifrado anterior: be49ee18837e815d391754a185bd10044a58403c0ff0b0775bd1532fa66c9941.
- Arquivo cifrado posterior: e7813cdb99dce8f1108c8d65282c309bf371dc932f6c0d8ca390c92c0af137bc.

Recuperação no Mac: primeiro executar `python3 ops/backup-integrity.py verify '<arquivo .enc>'`; depois usar `openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000`, obtendo a senha pelo Keychain sem imprimi-la. Extrair para diretório novo, restaurar com pg_restore --exit-on-error em banco isolado e comparar contagens/preços antes de qualquer promoção. Nunca restaurar diretamente sobre produção sem plano e autorização específicos.

Referência monetária oficial: https://docs.medusajs.com/resources/storefront-development/products/price/examples/show-price.
