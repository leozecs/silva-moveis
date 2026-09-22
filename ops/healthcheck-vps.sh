#!/usr/bin/env bash
set -Eeuo pipefail
PROJECT_DIR="${PROJECT_DIR:-/opt/silva-moveis}"
COMPOSE_FILE="${COMPOSE_FILE:-$PROJECT_DIR/docker-compose.prod.yml}"
MEDUSA_URL="${MEDUSA_URL:-http://127.0.0.1:9000}"
cd "$PROJECT_DIR"
docker compose --env-file .env.production -f "$COMPOSE_FILE" ps
curl --fail --silent --show-error --max-time 10 "$MEDUSA_URL/health" >/dev/null
docker compose --env-file .env.production -f "$COMPOSE_FILE" exec -T postgres pg_isready >/dev/null
docker compose --env-file .env.production -f "$COMPOSE_FILE" exec -T redis sh -c 'redis-cli -a "$REDIS_PASSWORD" ping' | grep -q PONG
df -P / | awk 'NR == 2 { if ($5+0 >= 85) exit 1 }'
echo "Health check OK"
