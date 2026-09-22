#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="${PROJECT_DIR:-/opt/silva-moveis}"
COMPOSE_FILE="${COMPOSE_FILE:-$PROJECT_DIR/docker-compose.prod.yml}"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_DIR/backups/postgres}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
cd "$PROJECT_DIR"
test -f .env.production || { echo "Arquivo .env.production ausente" >&2; exit 1; }
install -d -m 700 "$BACKUP_DIR"
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
backup_file="$BACKUP_DIR/medusa-$stamp.dump"
docker compose --env-file .env.production -f "$COMPOSE_FILE" exec -T postgres \
  sh -c 'pg_dump --format=custom --no-owner --no-privileges -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
  > "$backup_file"
chmod 600 "$backup_file"
find "$BACKUP_DIR" -type f -name 'medusa-*.dump' -mtime +"$RETENTION_DAYS" -delete
echo "Backup criado: $backup_file"
