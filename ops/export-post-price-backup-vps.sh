#!/usr/bin/env bash
set -Eeuo pipefail
AUDIT_DIR=/opt/silva-backups/catalog-audit-20260927
umask 077
docker exec silva-medusa-postgres sh -lc 'pg_dump --format=custom --no-owner --no-privileges -U "$POSTGRES_USER" -d "$POSTGRES_DB"' > "$AUDIT_DIR/post-price.dump"
docker exec silva-medusa-postgres sh -lc 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -AtF "|" -c "select v.sku,p.title,p.handle,pr.amount,p.thumbnail,p.description from product p join product_variant v on v.product_id=p.id join product_variant_price_set pv on pv.variant_id=v.id join price pr on pr.price_set_id=pv.price_set_id where p.deleted_at is null and v.deleted_at is null and pr.deleted_at is null order by v.sku;"' > "$AUDIT_DIR/post-price-catalog.psv"
tar -czf "$AUDIT_DIR/uploads.tar.gz" -C /opt/silva-moveis uploads
tar -czf "$AUDIT_DIR/post-price-export.tar.gz" -C "$AUDIT_DIR" post-price.dump post-price-catalog.psv uploads.tar.gz

# Restore test in a new isolated database; never replace the live database.
docker exec silva-medusa-postgres sh -lc 'createdb -U "$POSTGRES_USER" silva_backup_restore_20260928'
docker exec -i silva-medusa-postgres sh -lc 'pg_restore --exit-on-error --no-owner --no-privileges -U "$POSTGRES_USER" -d silva_backup_restore_20260928' < "$AUDIT_DIR/post-price.dump"
docker exec silva-medusa-postgres sh -lc 'psql -U "$POSTGRES_USER" -d silva_backup_restore_20260928 -Atc "select count(*) from product where deleted_at is null; select count(*),min(amount),max(amount) from price where deleted_at is null; select count(*) from mikro_orm_migrations;"'
sha256sum "$AUDIT_DIR/post-price.dump" "$AUDIT_DIR/post-price-export.tar.gz"
echo "Post-price backup exported and restore tested."
