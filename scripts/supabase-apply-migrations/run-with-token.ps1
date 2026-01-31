# Load SUPABASE_ACCESS_TOKEN from c:\Dev\Direct-Cuts\.env.local and run a Supabase CLI command.
# Usage: .\run-with-token.ps1 "supabase orgs list"
#        .\run-with-token.ps1 "supabase projects create q-reil --org-id mhaugpcyrrvpbccwksvj --db-password SECRET --region us-east-1 --yes"
$envPath = "c:\Dev\Direct-Cuts\.env.local"
if (-not (Test-Path $envPath)) {
    Write-Error "Not found: $envPath"
    exit 1
}
$line = Get-Content $envPath | Where-Object { $_ -match '^SUPABASE_ACCESS_TOKEN=' }
if ($line) {
    $env:SUPABASE_ACCESS_TOKEN = ($line -replace '^SUPABASE_ACCESS_TOKEN=', '').Trim()
}
if ($args.Count -gt 0) {
    $exe = $args[0]
    $rest = $args[1..($args.Count - 1)]
    & $exe @rest
} else {
    Write-Host "Usage: .\run-with-token.ps1 supabase <subcommand> [options]"
}
