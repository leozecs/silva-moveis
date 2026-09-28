#!/usr/bin/env bash
set -Eeuo pipefail
AUDIT_DIR=/opt/silva-backups/catalog-audit-20260927
previous_web_image="$(docker inspect -f '{{.Config.Image}}' silva-moveis-web)"
prices_changed=false
docker image inspect silva-web:price-20260928 >/dev/null
curl -fsS --max-time 10 http://127.0.0.1:3100/api/health >/dev/null
docker exec silva-medusa-postgres sh -lc 'psql -U "$POSTGRES_USER" -d silva_price_audit_20260928 -Atc "select count(*) from price where deleted_at is null"' | grep -qx 95

run_reprice() {
  docker run --rm --name silva-price-production-cli \
    --network silva-moveis_silva-commerce --env-file /opt/silva-moveis/backend/.env \
    -e REDIS_URL= -e NODE_ENV=production -e SILVA_DB_SSL_DISABLE=true -e SILVA_PRICE_MIGRATION=20260927 \
    -v "$AUDIT_DIR/reprice-open-carts.ts:/server/apps/backend/.medusa/server/src/scripts/reprice-open-carts.ts:ro" \
    silva-medusa:ea2d87a /server/apps/backend/node_modules/.bin/medusa exec ./src/scripts/reprice-open-carts.ts
}

rollback() {
  result=$?
  trap - ERR
  set +e
  docker stop silva-moveis-web silva-medusa-backend >/dev/null
  if "$prices_changed"; then
    docker exec -i silva-medusa-postgres sh -lc 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < "$AUDIT_DIR/rollback-prices.sql"
    run_reprice
  fi
  cp "$AUDIT_DIR/web.env.before" /opt/silva-moveis/web/.env
  chmod 600 /opt/silva-moveis/web/.env
  docker start silva-medusa-backend >/dev/null
  SILVA_WEB_IMAGE="$previous_web_image" docker compose -p silva-web -f /opt/silva-moveis/docker-compose.web.yml up -d web
  echo "Promotion failed. Previous price scale and web image restored; inspect logs."
  exit "$result"
}

cp /opt/silva-moveis/web/.env "$AUDIT_DIR/web.env.before"
chmod 600 "$AUDIT_DIR/web.env.before"
docker exec -i silva-medusa-postgres sh -lc 'psql -v ON_ERROR_STOP=1 -At -U "$POSTGRES_USER" -d "$POSTGRES_DB"' > "$AUDIT_DIR/rollback-prices.sql" <<'SQL'
SELECT 'BEGIN;';
SELECT format('UPDATE price SET amount=%s, raw_amount=%L::jsonb, updated_at=%L::timestamptz WHERE id=%L;', pr.amount, pr.raw_amount::text, pr.updated_at::text, pr.id)
FROM price pr JOIN product_variant_price_set pv ON pv.price_set_id=pr.price_set_id JOIN product_variant v ON v.id=pv.variant_id
WHERE pr.deleted_at IS NULL AND v.sku ~ '^SM-[0-9]{3}$';
SELECT format('UPDATE product SET subtitle=%L, updated_at=%L::timestamptz WHERE id=%L;', p.subtitle, p.updated_at::text, p.id)
FROM product p JOIN product_variant v ON v.product_id=p.id WHERE v.sku IN ('SM-052','SM-053','SM-054');
SELECT 'COMMIT;';
SQL
chmod 600 "$AUDIT_DIR/rollback-prices.sql"
trap rollback ERR

# Brief maintenance: no API writer remains active while prices and carts change.
docker stop silva-moveis-web silva-medusa-backend >/dev/null
docker exec silva-medusa-postgres sh -lc 'pg_dump --format=custom --no-owner --no-privileges -U "$POSTGRES_USER" -d "$POSTGRES_DB"' > "$AUDIT_DIR/pre-price-migration.dump"
chmod 600 "$AUDIT_DIR/pre-price-migration.dump"
docker exec -i silva-medusa-postgres sh -lc 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < "$AUDIT_DIR/normalize-catalog-prices.sql"
prices_changed=true
run_reprice
docker exec -i silva-medusa-postgres sh -lc 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' <<'SQL'
DO $$ BEGIN
  IF (SELECT count(*) FROM price WHERE deleted_at IS NULL) <> 95 OR EXISTS (
    SELECT 1 FROM cart_line_item cli JOIN product_variant_price_set pv ON pv.variant_id=cli.variant_id
    JOIN price pr ON pr.price_set_id=pv.price_set_id AND pr.deleted_at IS NULL AND pr.currency_code='brl'
    WHERE cli.deleted_at IS NULL AND cli.unit_price<>pr.amount
  ) THEN RAISE EXCEPTION 'Post-migration verification failed'; END IF;
END $$;
SQL
docker start silva-medusa-backend >/dev/null
for attempt in {1..20}; do
  if curl -fsS --max-time 3 http://127.0.0.1:9000/health >/dev/null; then break; fi
  sleep 3
done
curl -fsS --max-time 5 http://127.0.0.1:9000/health >/dev/null

docker exec -i silva-web-price-candidate node <<'JS'
const assert = require('node:assert/strict');
(async () => {
  const params = new URLSearchParams({limit:'100', fields:'id,handle,variants.sku,variants.calculated_price', region_id:process.env.NEXT_PUBLIC_MEDUSA_REGION_ID});
  const response = await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/products?${params}`, {headers:{'x-publishable-api-key':process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY}});
  assert.equal(response.status,200);
  const {products,count} = await response.json();
  assert.equal(count,95); assert.equal(products.length,95);
  for (const [sku,expected] of Object.entries({'SM-001':9300,'SM-052':3250,'SM-053':3750,'SM-054':3050})) {
    const variant=products.flatMap(p=>p.variants).find(v=>v.sku===sku);
    assert.equal(variant.calculated_price.calculated_amount,expected);
  }
  console.log('Storefront API: 95 products, corrected BRL prices verified.');
})().catch(error=>{console.error(error.message);process.exit(1)});
JS

sed -i 's/^MEDUSA_PRICES_VERIFIED=false$/MEDUSA_PRICES_VERIFIED=true/' /opt/silva-moveis/web/.env
grep -qx 'MEDUSA_PRICES_VERIFIED=true' /opt/silva-moveis/web/.env
SILVA_WEB_IMAGE=silva-web:price-20260928 docker compose -p silva-web -f /opt/silva-moveis/docker-compose.web.yml up -d web
for attempt in {1..20}; do
  if curl -fsS --max-time 3 http://127.0.0.1:3000/api/health >/dev/null; then break; fi
  sleep 3
done
curl -fsS --max-time 5 http://127.0.0.1:3000/api/health >/dev/null
trap - ERR
echo "VPS price promotion completed. Promote the prepared Vercel deployment immediately."
