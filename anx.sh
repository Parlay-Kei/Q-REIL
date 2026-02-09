#!/usr/bin/env sh
# Mission Router Wrapper - anx
# OCS-MISSION: PLATOPS-ANX-MISSION-ROUTER-WRAPPER-0022
# Enforces mission routing: mission ID, agent owner, receipt paths

set -e

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
RESET='\033[0m'

MISSION_ID=""
AGENT=""
RECEIPTS=""
COMMAND=""

# Parse arguments
while [ $# -gt 0 ]; do
    case "$1" in
        --mission-id|--MissionId|-m)
            MISSION_ID="$2"
            shift 2
            ;;
        --agent|--Agent|-a)
            AGENT="$2"
            shift 2
            ;;
        --receipts|--Receipts|-r)
            RECEIPTS="$2"
            shift 2
            ;;
        --)
            shift
            COMMAND="$*"
            break
            ;;
        *)
            echo "Unknown option: $1" >&2
            exit 1
            ;;
    esac
done

write_error_banner() {
    echo ""
    echo "${RED}╔════════════════════════════════════════════════════════════╗${RESET}"
    echo "${RED}║  MISSION ROUTER ERROR                                    ║${RESET}"
    echo "${RED}╚════════════════════════════════════════════════════════════╝${RESET}"
    echo "${RED}$1${RESET}"
    echo ""
}

write_compliance_banner() {
    echo ""
    echo "${GREEN}╔════════════════════════════════════════════════════════════╗${RESET}"
    echo "${GREEN}║  MISSION ROUTER COMPLIANCE                               ║${RESET}"
    echo "${GREEN}╚════════════════════════════════════════════════════════════╝${RESET}"
    echo "${BLUE}Mission ID:${RESET} $1"
    echo "${BLUE}Agent Owner:${RESET} $2"
    echo "${BLUE}Receipt Targets:${RESET}"
    IFS=',' read -ra RECEIPT_ARRAY <<< "$3"
    for receipt in "${RECEIPT_ARRAY[@]}"; do
        echo "  - $receipt"
    done
    echo ""
}

show_mission_template() {
    echo ""
    echo "${YELLOW}════════════════════════════════════════════════════════════${RESET}"
    echo "${YELLOW}  CORRECT MISSION TEMPLATE                                ${RESET}"
    echo "${YELLOW}════════════════════════════════════════════════════════════${RESET}"
    echo ""
    echo "Usage:"
    echo "  ./anx.sh --mission-id <MISSION-ID> --agent <AGENT-NAME> --receipts <PATH1>,<PATH2> -- <COMMAND>"
    echo ""
    echo "Example:"
    echo "  ./anx.sh --mission-id PLATOPS-ANX-MISSION-ROUTER-WRAPPER-0022 --agent github-admin --receipts proofs/anx/MISSION_ROUTER_PROOF_PACK_0022 -- node scripts/test.mjs"
    echo ""
    echo "Required Parameters:"
    echo "  --mission-id  : Mission identifier (e.g., PLATOPS-ANX-MISSION-ROUTER-WRAPPER-0022)"
    echo "  --agent       : Department owner agent (e.g., github-admin, platops, qag)"
    echo "  --receipts    : Comma-separated list of expected receipt paths"
    echo "  --            : Separator before command to execute"
    echo ""
    echo "Mission ID Format:"
    echo "  <DEPARTMENT>-<PROJECT>-<DESCRIPTION>-<NUMBER>"
    echo "  Examples: PLATOPS-ANX-MISSION-ROUTER-WRAPPER-0022"
    echo "           QAG-AGENT-ARCHITECTURE-ENFORCEMENT-GATE-0025"
    echo ""
    echo "Agent Examples:"
    echo "  github-admin, platops, qag, engdel, relops, proops, ocs"
    echo ""
}

# Validation: Check if mission ID is provided
if [ -z "$MISSION_ID" ]; then
    write_error_banner "MISSION ID REQUIRED"
    echo "Every run must include a mission ID."
    show_mission_template
    exit 1
fi

# Validation: Check if agent is provided
if [ -z "$AGENT" ]; then
    write_error_banner "AGENT OWNER REQUIRED"
    echo "Every mission must specify a department owner agent."
    show_mission_template
    exit 1
fi

# Validation: Check if receipts are provided
if [ -z "$RECEIPTS" ]; then
    write_error_banner "RECEIPT PATHS REQUIRED"
    echo "Every mission must specify expected receipt paths."
    show_mission_template
    exit 1
fi

# Validation: Check if command is provided
if [ -z "$COMMAND" ]; then
    write_error_banner "COMMAND REQUIRED"
    echo "No command provided after -- separator."
    show_mission_template
    exit 1
fi

# Display compliance banner
write_compliance_banner "$MISSION_ID" "$AGENT" "$RECEIPTS"

# Create receipt stub directories and files
IFS=',' read -ra RECEIPT_ARRAY <<< "$RECEIPTS"
for receipt in "${RECEIPT_ARRAY[@]}"; do
    receipt_dir=$(dirname "$receipt")
    if [ -n "$receipt_dir" ] && [ "$receipt_dir" != "." ]; then
        mkdir -p "$receipt_dir"
        echo "${YELLOW}Created receipt directory: $receipt_dir${RESET}"
    fi
    
    # Create receipt stub file if it doesn't exist
    if [ ! -f "$receipt" ]; then
        cat > "$receipt" <<EOF
# Mission Receipt Stub

**Mission:** $MISSION_ID
**Owner:** $AGENT
**Receipt Path:** $receipt
**Created:** $(date '+%Y-%m-%d %H:%M:%S')

---

## Execution Summary

*Receipt stub created by Mission Router wrapper. Replace this with actual execution details.*

EOF
        echo "${GREEN}Created receipt stub: $receipt${RESET}"
    fi
done

echo "${BLUE}Executing command: $COMMAND${RESET}"
echo ""

# Execute the command
eval "$COMMAND"
EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo "${GREEN}╔════════════════════════════════════════════════════════════╗${RESET}"
    echo "${GREEN}║  MISSION EXECUTION COMPLETE                              ║${RESET}"
    echo "${GREEN}╚════════════════════════════════════════════════════════════╝${RESET}"
    echo "${BLUE}Mission ID:${RESET} $MISSION_ID"
    echo "${BLUE}Exit Code:${RESET} $EXIT_CODE"
    echo ""
else
    echo "${RED}╔════════════════════════════════════════════════════════════╗${RESET}"
    echo "${RED}║  MISSION EXECUTION FAILED                                 ║${RESET}"
    echo "${RED}╚════════════════════════════════════════════════════════════╝${RESET}"
    echo "${BLUE}Mission ID:${RESET} $MISSION_ID"
    echo "${BLUE}Exit Code:${RESET} $EXIT_CODE"
    echo ""
fi

exit $EXIT_CODE
