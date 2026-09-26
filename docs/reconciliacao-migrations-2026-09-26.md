# Reconciliação das migrations Medusa — 26/09/2026

## Causa observada

O banco de produção já tinha as tabelas centrais do Medusa 2.20.1, mas o dump anterior à tentativa de deploy não tinha registros em `mikro_orm_migrations`. Por isso `db:migrate` tentava recriar tabelas, índices e constraints existentes. A primeira tentativa falha havia aplicado parcialmente 23 migrations, inclusive `Migration20260924013659` do módulo `silva_checkout`.

## Verificações antes da correção

- Backup custom-format anterior em `/opt/silva-backups/43d2870/postgres.dump`, restaurado com `pg_restore` código 0 no banco isolado `silva_migration_audit_ea2d87a`: 95 produtos.
- Banco novo `silva_fresh_reference_ea2d87a` migrado do zero com a mesma imagem imutável `silva-medusa:ea2d87a`: `db:migrate` código 0, 181 nomes únicos em `mikro_orm_migrations`.
- Dumps de schema do banco novo e da cópia restaurada tinham o mesmo conteúdo após normalizar apenas o `run_id` gerado em runtime, a grafia equivalente de um índice e os delimitadores aleatórios do `pg_dump`. Não houve diferença de tabelas, colunas, constraints ou outros índices.
- Os 23 nomes já registrados na produção eram subconjunto dos 181 do banco novo. O banco novo serviu somente de referência de nomes; **não** foram copiados `script_migrations` nem `link_module_migrations`, porque essas etapas precisavam executar contra os dados reais.
- Backup imediatamente anterior à reconciliação em `/opt/silva-backups/reconcile-20260926/pre-reconcile.dump`; `pg_restore --list` validou 1046 entradas. Schema vivo equivalente ao clone antes da alteração do ledger.

## Aplicação e resultado

Os nomes centrais ausentes foram inseridos de forma idempotente e transacional primeiro no clone restaurado, depois na produção. Em cada banco, o Medusa executou `db:migrate` duas vezes: quatro execuções com código 0. O primeiro passe executou links e scripts de dados; o segundo confirmou repetibilidade.

Pós-verificação em produção: 181 registros em `mikro_orm_migrations`, 20 em `link_module_migrations`, 5 em `script_migrations`; 95 produtos, 95 variantes, 95 itens de estoque, zero clientes e zero pedidos. `/health` público respondeu 200 e `/store/products` retornou 95 produtos com a chave do canal da loja. Logs em `/opt/silva-backups/reconcile-20260926/`.

## Limites

- O container de produção ainda usa a imagem anterior `silva-moveis-medusa`; esta tarefa reconciliou o banco, **não** promoveu `silva-medusa:ea2d87a`.
- Os bancos isolados continuam na VPS para auditoria. Não os confundir com produção nem usar como origem de dados comerciais.
- Uma futura versão do Medusa exige nova comparação e backup; não reutilizar cegamente a lista de 181 nomes de migrations.
- Backup na mesma VPS não substitui cópia externa nem teste de recuperação após perda da máquina.
