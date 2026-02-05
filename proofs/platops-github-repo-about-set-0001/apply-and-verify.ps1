# PLATOPS-GITHUB-REPO-ABOUT-SET-0001 — Apply description and verify
# Requires: $env:GITHUB_TOKEN or $env:GH_TOKEN with repo scope
# Usage: .\apply-and-verify.ps1

$ErrorActionPreference = "Stop"
$token = $env:GITHUB_TOKEN
if (-not $token) { $token = $env:GH_TOKEN }
if (-not $token) {
    Write-Error "Set GITHUB_TOKEN or GH_TOKEN with repo scope."
    exit 1
}

$uri = "https://api.github.com/repos/Parlay-Kei/Q-REIL"
$targetDesc = "Q REIL - Real Estate Intelligence Ledger"
$body = @{ description = $targetDesc } | ConvertTo-Json

# PATCH
Invoke-RestMethod -Uri $uri -Headers @{
    Accept = "application/vnd.github.v3+json"
    Authorization = "Bearer $token"
} -Method Patch -Body $body -ContentType "application/json" | Out-Null

# Verify
$after = Invoke-RestMethod -Uri $uri -Headers @{ Accept = "application/vnd.github.v3+json" } -Method Get
if ($after.description -eq $targetDesc) {
    Write-Host "OK: description = '$targetDesc'"
    exit 0
} else {
    Write-Error "Mismatch: got '$($after.description)'"
    exit 1
}
