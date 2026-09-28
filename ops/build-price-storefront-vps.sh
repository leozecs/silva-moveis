#!/usr/bin/env bash
set -Eeuo pipefail
RELEASE_DIR=/opt/silva-moveis/web-release-20260928
AUDIT_DIR=/opt/silva-backups/catalog-audit-20260927
test -s "$AUDIT_DIR/web-source.tar.gz"
test ! -L "$RELEASE_DIR"
install -d "$RELEASE_DIR"
tar -xzf "$AUDIT_DIR/web-source.tar.gz" -C "$RELEASE_DIR"
set -a
source /opt/silva-moveis/web/.env
set +a
docker build -t silva-web:price-20260928 \
  --build-arg NEXT_PUBLIC_MEDUSA_BACKEND_URL \
  --build-arg NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY \
  --build-arg NEXT_PUBLIC_MEDUSA_REGION_ID "$RELEASE_DIR"
docker run -d --name silva-web-price-candidate \
  --network silva-moveis_silva-commerce \
  --env-file /opt/silva-moveis/web/.env \
  -e PORT=3000 -p 127.0.0.1:3100:3000 --memory=1g \
  silva-web:price-20260928
echo "Candidate storefront prepared; public container and prices unchanged."
