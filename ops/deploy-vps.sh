#!/usr/bin/env bash
set -Eeuo pipefail

# Run this script on the VPS from the canonical project directory.
# It migrates before restarting Medusa so a failed migration never promotes
# a backend that is out of sync with the database.

PROJECT_DIR="${PROJECT_DIR:-/opt/silva-moveis}"
COMPOSE_FILE="${COMPOSE_FILE:-$PROJECT_DIR/docker-compose.yml}"

cd "$PROJECT_DIR"

docker compose -f "$COMPOSE_FILE" config --quiet
docker compose -f "$COMPOSE_FILE" up -d postgres redis
docker compose -f "$COMPOSE_FILE" run --rm medusa pnpm --filter @dtc/backend exec medusa db:migrate
docker compose -f "$COMPOSE_FILE" up -d --build medusa

for attempt in {1..20}; do
  if curl --fail --silent --show-error --max-time 5 http://127.0.0.1:9000/health >/dev/null; then
    echo "Medusa is healthy."
    exit 0
  fi
  sleep 3
done

echo "Medusa did not become healthy in time." >&2
docker compose -f "$COMPOSE_FILE" logs --tail=100 medusa >&2 || true
exit 1
