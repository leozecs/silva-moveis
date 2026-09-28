#!/usr/bin/env bash
set -Eeuo pipefail

# Run on the VPS after copying this script, SQL and reprice script to AUDIT_DIR.
AUDIT_DIR=/opt/silva-backups/catalog-audit-20260927
AUDIT_DATABASE=silva_price_audit_20260928
test -s "$AUDIT_DIR/medusa.dump"
test -s "$AUDIT_DIR/normalize-catalog-prices.sql"
test -s "$AUDIT_DIR/reprice-open-carts.ts"

# createdb fails rather than replacing an existing database.
docker exec silva-medusa-postgres sh -lc 'createdb -U "$POSTGRES_USER" silva_price_audit_20260928'
docker exec -i silva-medusa-postgres sh -lc 'pg_restore --exit-on-error --no-owner --no-privileges -U "$POSTGRES_USER" -d silva_price_audit_20260928' < "$AUDIT_DIR/medusa.dump"
docker exec -i silva-medusa-postgres sh -lc 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d silva_price_audit_20260928' < "$AUDIT_DIR/normalize-catalog-prices.sql"

audit_database_url="$(docker exec silva-medusa-backend node -e 'const u = new URL(process.env.DATABASE_URL); u.pathname = "/silva_price_audit_20260928"; process.stdout.write(u.toString())')"
docker run --rm --name silva-price-audit-cli \
  --network silva-moveis_silva-commerce \
  --env-file /opt/silva-moveis/backend/.env \
  -e DATABASE_URL="$audit_database_url" -e REDIS_URL= \
  -e SILVA_PRICE_MIGRATION=20260927 \
  -v "$AUDIT_DIR/reprice-open-carts.ts:/server/apps/backend/.medusa/server/src/scripts/reprice-open-carts.ts:ro" \
  silva-medusa:ea2d87a /server/apps/backend/node_modules/.bin/medusa exec ./src/scripts/reprice-open-carts.ts
unset audit_database_url

docker exec -i silva-medusa-postgres sh -lc 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d silva_price_audit_20260928' <<'SQL'
SELECT count(*) AS prices, min(amount), max(amount) FROM price WHERE deleted_at IS NULL;
SELECT count(*) AS cart_price_mismatches
FROM cart_line_item cli
JOIN product_variant_price_set pv ON pv.variant_id = cli.variant_id
JOIN price pr ON pr.price_set_id = pv.price_set_id AND pr.deleted_at IS NULL AND pr.currency_code = 'brl'
WHERE cli.deleted_at IS NULL AND cli.unit_price <> pr.amount;
SQL
echo "Price migration clone test finished. Production was not modified."
