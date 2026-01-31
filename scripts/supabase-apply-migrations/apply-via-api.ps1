# Apply Q-REIL migrations to project umzuncubiizoomoxlgts via Management API.
# Reads SUPABASE_ACCESS_TOKEN from c:\Dev\Direct-Cuts\.env.local
# Usage: .\apply-via-api.ps1

$ErrorActionPreference = "Stop"
$envPath = "c:\Dev\Direct-Cuts\.env.local"
if (-not (Test-Path $envPath)) { Write-Error "Not found: $envPath"; exit 1 }
$line = Get-Content $envPath | Where-Object { $_ -match '^SUPABASE_ACCESS_TOKEN=' }
if (-not $line) { Write-Error "SUPABASE_ACCESS_TOKEN not found"; exit 1 }
$token = ($line -replace '^SUPABASE_ACCESS_TOKEN=', '').Trim()

$projectRef = "umzuncubiizoomoxlgts"
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$migrationsDir = Join-Path $root "docs\02_DATA\migrations"
$order = @(
  "00001_create_orgs.sql", "00002_create_users.sql", "00003_create_user_roles.sql",
  "00004_create_helper_functions.sql", "00017_create_events.sql", "00018_create_event_triggers.sql",
  "00019_create_updated_at_triggers.sql", "00021_enable_rls_org_layer.sql",
  "00030_create_mail_tables.sql", "00031_mail_rls_policies.sql", "00032_mail_upsert_service_role.sql"
)

$headers = @{
  "Authorization" = "Bearer $token"
  "Content-Type"  = "application/json"
}
$baseUri = "https://api.supabase.com/v1/projects/$projectRef/database/query"

foreach ($f in $order) {
  $path = Join-Path $migrationsDir $f
  if (-not (Test-Path $path)) { Write-Host "Skip (missing): $f"; continue }
  $sql = Get-Content $path -Raw
  $bodyObj = @{ query = $sql }
  $body = $bodyObj | ConvertTo-Json -Depth 10 -Compress
  # ConvertTo-Json escapes " and \ but may not handle newlines in all PS versions
  $body = $body -replace "`r`n", "`n" -replace "`n", "\n" -replace "`t", "\t"
  if ($body -notmatch '^\{') { $body = '{"query":' + ([System.Text.Json.JsonSerializer]::Serialize($sql)) + '}' }
  Write-Host "Applying $f ..."
  try {
    $response = Invoke-RestMethod -Uri $baseUri -Method Post -Headers $headers -Body $body
    Write-Host "  OK"
  } catch {
    Write-Host "  Error: $($_.Exception.Message)"
    if ($_.ErrorDetails.Message) { Write-Host "  $($_.ErrorDetails.Message)" }
    exit 1
  }
}
Write-Host "Done."
