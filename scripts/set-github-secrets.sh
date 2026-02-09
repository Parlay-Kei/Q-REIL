#!/bin/bash
# Secure script to set GitHub Actions secrets from .env.local files
# Mission: GITHUBADMIN-QREIL-SECRETS-PROMOTION-0021

set -e

echo "Setting GitHub Actions secrets for Q-REIL..."
echo "Reading values from local .env.local files (values never printed)"

# Source the env files
if [ -f "q-reil/.env.local" ]; then
    source q-reil/.env.local
fi

if [ -f "scripts/supabase-apply-migrations/.env.local" ]; then
    source scripts/supabase-apply-migrations/.env.local
fi

# Set SUPABASE_SERVICE_ROLE_KEY
if [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "Setting SUPABASE_SERVICE_ROLE_KEY..."
    echo "$SUPABASE_SERVICE_ROLE_KEY" | gh secret set SUPABASE_SERVICE_ROLE_KEY --repo Parlay-Kei/Q-REIL
    echo "✅ SUPABASE_SERVICE_ROLE_KEY set"
else
    echo "❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local"
    exit 1
fi

# Set SUPABASE_DB_URL
if [ -n "$SUPABASE_DB_URL" ]; then
    echo "Setting SUPABASE_DB_URL..."
    echo "$SUPABASE_DB_URL" | gh secret set SUPABASE_DB_URL --repo Parlay-Kei/Q-REIL
    echo "✅ SUPABASE_DB_URL set"
else
    echo "❌ SUPABASE_DB_URL not found in .env.local"
    exit 1
fi

echo ""
echo "GitHub Actions secrets promotion complete!"
echo "Verifying secrets exist (names only)..."

gh secret list --repo Parlay-Kei/Q-REIL | grep -E "SUPABASE" || true

echo ""
echo "Next steps:"
echo "1. Run: gh workflow run q-reil-supabase-secrets-promote.yml --repo Parlay-Kei/Q-REIL"
echo "2. Run: gh workflow run q-reil-vercel-env-assert.yml --repo Parlay-Kei/Q-REIL"