#!/usr/bin/env sh
# Apply Q REIL migrations in order. Requires SUPABASE_DB_URL and psql.
# Usage: SUPABASE_DB_URL="postgresql://..." ./apply.sh

set -e
ROOT="${ROOT:-$(dirname "$0")/../..}"
MIGRATIONS_DIR="${MIGRATIONS_DIR:-$ROOT/docs/02_DATA/migrations}"
ORDER="00001_create_orgs.sql 00002_create_users.sql 00003_create_user_roles.sql 00004_create_helper_functions.sql 00017_create_events.sql 00018_create_event_triggers.sql 00019_create_updated_at_triggers.sql 00021_enable_rls_org_layer.sql 00030_create_mail_tables.sql 00031_mail_rls_policies.sql 00032_mail_upsert_service_role.sql"

if [ -z "$SUPABASE_DB_URL" ]; then
  echo "Set SUPABASE_DB_URL (Database connection URI from Supabase Settings → Database)."
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql not found. Install PostgreSQL client or run migrations manually in Dashboard SQL Editor (see README.md)."
  exit 1
fi

for f in $ORDER; do
  path="$MIGRATIONS_DIR/$f"
  if [ -f "$path" ]; then
    echo "Applying $f ..."
    psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f "$path"
  else
    echo "Skip (missing): $path"
  fi
done

echo "Done."
