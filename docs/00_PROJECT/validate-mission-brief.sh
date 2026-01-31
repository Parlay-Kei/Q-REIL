#!/usr/bin/env sh
# Mission header validator — Q REIL v0.1
# Usage: ./validate-mission-brief.sh <path-to-mission-brief.md>
# Exit 0 if brief contains PRD_Q_REIL_v0.1, §6, §10; else exit 1.
# See docs/q-reil/OCS_RULES.md (Mission header validator).

set -e
FILE="${1:?Usage: $0 <path-to-mission-brief.md>}"
ok=0
grep -q 'PRD_Q_REIL_v0\.1' "$FILE" && grep -q '§6' "$FILE" && grep -q '§10' "$FILE" && ok=1
[ "$ok" = 1 ] && echo "OK: mission brief contains PRD_Q_REIL_v0.1, §6, §10" || { echo "FAIL: brief must contain PRD_Q_REIL_v0.1, §6, §10"; exit 1; }
