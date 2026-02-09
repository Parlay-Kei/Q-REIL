# Mission Router Wrapper - anx
# OCS-MISSION: PLATOPS-ANX-MISSION-ROUTER-WRAPPER-0022
# Enforces mission routing: mission ID, agent owner, receipt paths

param(
    [Parameter(Mandatory=$false)]
    [string]$MissionId,
    
    [Parameter(Mandatory=$false)]
    [string]$Agent,
    
    [Parameter(Mandatory=$false)]
    [string[]]$Receipts
)

# Parse remaining arguments to find command after --
$Command = @()
$foundSeparator = $false
foreach ($arg in $args) {
    if ($arg -eq '--') {
        $foundSeparator = $true
        continue
    }
    if ($foundSeparator) {
        $Command += $arg
    }
}

# ANSI color codes for Windows PowerShell
$ESC = [char]27
$RED = "$ESC[31m"
$GREEN = "$ESC[32m"
$YELLOW = "$ESC[33m"
$BLUE = "$ESC[34m"
$RESET = "$ESC[0m"

function Write-Error-Banner {
    param([string]$Message)
    Write-Host ""
    Write-Host "$RED╔════════════════════════════════════════════════════════════╗$RESET"
    Write-Host "$RED║  MISSION ROUTER ERROR                                    ║$RESET"
    Write-Host "$RED╚════════════════════════════════════════════════════════════╝$RESET"
    Write-Host "$RED$Message$RESET"
    Write-Host ""
}

function Write-Compliance-Banner {
    param(
        [string]$MissionId,
        [string]$Agent,
        [string[]]$Receipts
    )
    Write-Host ""
    Write-Host "$GREEN╔════════════════════════════════════════════════════════════╗$RESET"
    Write-Host "$GREEN║  MISSION ROUTER COMPLIANCE                               ║$RESET"
    Write-Host "$GREEN╚════════════════════════════════════════════════════════════╝$RESET"
    Write-Host "$BLUE Mission ID:$RESET $MissionId"
    Write-Host "$BLUE Agent Owner:$RESET $Agent"
    Write-Host "$BLUE Receipt Targets:$RESET"
    foreach ($receipt in $Receipts) {
        Write-Host "  - $receipt"
    }
    Write-Host ""
}

function Show-Mission-Template {
    Write-Host ""
    Write-Host "$YELLOW════════════════════════════════════════════════════════════$RESET"
    Write-Host "$YELLOW  CORRECT MISSION TEMPLATE                                $RESET"
    Write-Host "$YELLOW════════════════════════════════════════════════════════════$RESET"
    Write-Host ""
    Write-Host "Usage:"
    Write-Host "  .\anx.ps1 -MissionId <MISSION-ID> -Agent <AGENT-NAME> -Receipts <PATH1>,<PATH2> -- <COMMAND>"
    Write-Host ""
    Write-Host "Example:"
    Write-Host "  .\anx.ps1 -MissionId PLATOPS-ANX-MISSION-ROUTER-WRAPPER-0022 -Agent github-admin -Receipts proofs/anx/MISSION_ROUTER_PROOF_PACK_0022 -- node scripts/test.mjs"
    Write-Host ""
    Write-Host "Required Parameters:"
    Write-Host "  -MissionId    : Mission identifier (e.g., PLATOPS-ANX-MISSION-ROUTER-WRAPPER-0022)"
    Write-Host "  -Agent        : Department owner agent (e.g., github-admin, platops, qag)"
    Write-Host "  -Receipts     : Comma-separated list of expected receipt paths"
    Write-Host "  --            : Separator before command to execute"
    Write-Host ""
    Write-Host "Mission ID Format:"
    Write-Host "  <DEPARTMENT>-<PROJECT>-<DESCRIPTION>-<NUMBER>"
    Write-Host "  Examples: PLATOPS-ANX-MISSION-ROUTER-WRAPPER-0022"
    Write-Host "           QAG-AGENT-ARCHITECTURE-ENFORCEMENT-GATE-0025"
    Write-Host ""
    Write-Host "Agent Examples:"
    Write-Host "  github-admin, platops, qag, engdel, relops, proops, ocs"
    Write-Host ""
}

# Validation: Check if mission ID is provided
if ([string]::IsNullOrWhiteSpace($MissionId)) {
    Write-Error-Banner "MISSION ID REQUIRED"
    Write-Host "Every run must include a mission ID."
    Show-Mission-Template
    exit 1
}

# Validation: Check if agent is provided
if ([string]::IsNullOrWhiteSpace($Agent)) {
    Write-Error-Banner "AGENT OWNER REQUIRED"
    Write-Host "Every mission must specify a department owner agent."
    Show-Mission-Template
    exit 1
}

# Validation: Check if receipts are provided
if ($null -eq $Receipts -or $Receipts.Count -eq 0) {
    Write-Error-Banner "RECEIPT PATHS REQUIRED"
    Write-Host "Every mission must specify expected receipt paths."
    Show-Mission-Template
    exit 1
}

# Validation: Check if command is provided
if ($null -eq $Command -or $Command.Count -eq 0) {
    Write-Error-Banner "COMMAND REQUIRED"
    Write-Host "No command provided after -- separator."
    Show-Mission-Template
    exit 1
}

# Display compliance banner
Write-Compliance-Banner -MissionId $MissionId -Agent $Agent -Receipts $Receipts

# Create receipt stub directories if they don't exist
foreach ($receipt in $Receipts) {
    $receiptDir = Split-Path -Path $receipt -Parent
    if (-not [string]::IsNullOrWhiteSpace($receiptDir) -and -not (Test-Path $receiptDir)) {
        New-Item -ItemType Directory -Path $receiptDir -Force | Out-Null
        Write-Host "$YELLOW Created receipt directory: $receiptDir$RESET"
    }
    
    # Create receipt stub file if it doesn't exist
    if (-not (Test-Path $receipt)) {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $receiptContent = "# Mission Receipt Stub`n`n**Mission:** $MissionId`n**Owner:** $Agent`n**Receipt Path:** $receipt`n**Created:** $timestamp`n`n---`n`n## Execution Summary`n`n*Receipt stub created by Mission Router wrapper. Replace this with actual execution details.*`n"
        Set-Content -Path $receipt -Value $receiptContent
        Write-Host "$GREEN Created receipt stub: $receipt$RESET"
    }
}

Write-Host "$BLUE Executing command: $($Command -join ' ')$RESET"
Write-Host ""

# Execute the command
$commandString = $Command -join ' '
try {
    Invoke-Expression $commandString
    $exitCode = $LASTEXITCODE
    if ($exitCode -eq $null) { $exitCode = 0 }
    
    Write-Host ""
    Write-Host "$GREEN╔════════════════════════════════════════════════════════════╗$RESET"
    Write-Host "$GREEN║  MISSION EXECUTION COMPLETE                              ║$RESET"
    Write-Host "$GREEN╚════════════════════════════════════════════════════════════╝$RESET"
    Write-Host "$BLUE Mission ID:$RESET $MissionId"
    Write-Host "$BLUE Exit Code:$RESET $exitCode"
    Write-Host ""
    
    exit $exitCode
} catch {
    Write-Host ""
    Write-Host "$RED╔════════════════════════════════════════════════════════════╗$RESET"
    Write-Host "$RED║  MISSION EXECUTION FAILED                                 ║$RESET"
    Write-Host "$RED╚════════════════════════════════════════════════════════════╝$RESET"
    Write-Host "$RED Error:$RESET $_"
    Write-Host ""
    exit 1
}
