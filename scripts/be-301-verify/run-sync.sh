#!/usr/bin/env sh
# BE-301: Trigger Gmail 7-day sync. Requires BASE_URL and auth (COOKIE or BEARER_TOKEN).
# Usage:
#   BASE_URL=http://localhost:3000 COOKIE="sb-xxx-auth-token=..." ./run-sync.sh
#   BASE_URL=http://localhost:3000 BEARER_TOKEN=eyJ... ./run-sync.sh

set -e
BASE_URL="${BASE_URL:-http://localhost:3000}"
BODY="${1:-{\"forceFullSync\": true}}"

if [ -n "$BEARER_TOKEN" ]; then
  curl -sS -X POST "$BASE_URL/api/connectors/gmail/sync" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $BEARER_TOKEN" \
    -d "$BODY"
elif [ -n "$COOKIE" ]; then
  curl -sS -X POST "$BASE_URL/api/connectors/gmail/sync" \
    -H "Content-Type: application/json" \
    -H "Cookie: $COOKIE" \
    -d "$BODY"
else
  echo "Set COOKIE or BEARER_TOKEN (and optionally BASE_URL). See README.md."
  exit 1
fi
