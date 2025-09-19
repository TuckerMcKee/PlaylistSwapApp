#!/usr/bin/env bash
set -euo pipefail

# --- Config ---
# These can come from .env or fall back to sane defaults for local dev.
ENV_FILE="${ENV_FILE:-.env}"
DB_NAME="${DB_NAME:-playlistswap}"
DB_USER="${DB_USER:-playlistswap_user}"
DB_PASS="${DB_PASS:-dev-password}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# Admin connection (defaults to your local mac username + no password)
# Override with PGADMIN_USER/PGADMIN_PASS in your .env if needed.
PGADMIN_USER="${PGADMIN_USER:-$USER}"
PGADMIN_PASS="${PGADMIN_PASS:-}"

SCHEMA_FILE="${SCHEMA_FILE:-server/db/schema.sql}"  # change if your schema lives elsewhere

# --- Load .env if present ---
if [[ -f "$ENV_FILE" ]]; then
  # export only non-comment KEY=VALUE lines
  export $(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$ENV_FILE" | xargs) || true
  # Allow .env to override defaults defined above
  DB_NAME="${DB_NAME:-playlistswap}"
  DB_USER="${DB_USER:-playlistswap_user}"
  DB_PASS="${DB_PASS:-dev-password}"
  DB_HOST="${DB_HOST:-localhost}"
  DB_PORT="${DB_PORT:-5432}"
  PGADMIN_USER="${PGADMIN_USER:-$USER}"
  PGADMIN_PASS="${PGADMIN_PASS:-}"
  SCHEMA_FILE="${SCHEMA_FILE:-server/db/schema.sql}"
fi

echo "==> Using admin: ${PGADMIN_USER}@${DB_HOST}:${DB_PORT}"
echo "==> Target DB: ${DB_NAME} (user: ${DB_USER})"

# Build a psql connection string to the 'postgres' maintenance DB
ADMIN_URL="postgresql://${PGADMIN_USER}@${DB_HOST}:${DB_PORT}/postgres"
if [[ -n "$PGADMIN_PASS" ]]; then
  export PGPASSWORD="$PGADMIN_PASS"
fi

# --- Ensure Postgres is reachable ---
echo "==> Checking Postgres connectivity..."
psql "$ADMIN_URL" -v ON_ERROR_STOP=1 -c "SELECT version();" >/dev/null

# --- Create role if needed ---
echo "==> Ensuring role '${DB_USER}' exists..."
ROLE_EXISTS=$(psql "$ADMIN_URL" -qtAX -c "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" || true)
if [[ "$ROLE_EXISTS" != "1" ]]; then
  psql "$ADMIN_URL" -v ON_ERROR_STOP=1 -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';"
  echo "   Created user ${DB_USER}."
else
  echo "   Role already exists."
fi

# --- Create DB if needed ---
echo "==> Ensuring database '${DB_NAME}' exists..."
DB_EXISTS=$(psql "$ADMIN_URL" -qtAX -c "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" || true)
if [[ "$DB_EXISTS" != "1" ]]; then
  psql "$ADMIN_URL" -v ON_ERROR_STOP=1 -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
  echo "   Created database ${DB_NAME}."
else
  echo "   Database already exists."
fi

# --- Grant privileges (safe to re-run) ---
echo "==> Granting privileges..."
DB_URL="postgresql://${PGADMIN_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
psql "$DB_URL" -v ON_ERROR_STOP=1 -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"
psql "$DB_URL" -v ON_ERROR_STOP=1 -c "ALTER DATABASE ${DB_NAME} OWNER TO ${DB_USER};"

# --- Run schema if present ---
if [[ -f "$SCHEMA_FILE" ]]; then
  echo "==> Running schema: ${SCHEMA_FILE}"
  # connect as the app user so ownership is correct
  export PGPASSWORD="$DB_PASS"
  APP_URL="postgresql://${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
  psql "$APP_URL" -v ON_ERROR_STOP=1 -f "$SCHEMA_FILE"
else
  echo "==> No schema file found at ${SCHEMA_FILE} (skip)."
fi

echo "✅ Database ready."
