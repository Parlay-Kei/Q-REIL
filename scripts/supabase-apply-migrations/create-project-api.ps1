# Create Q-REIL Supabase project via Management API (avoids CLI region bug).
# Reads SUPABASE_ACCESS_TOKEN from c:\Dev\Direct-Cuts\.env.local
# Usage: .\create-project-api.ps1

$envPath = "c:\Dev\Direct-Cuts\.env.local"
if (-not (Test-Path $envPath)) { Write-Error "Not found: $envPath"; exit 1 }
$line = Get-Content $envPath | Where-Object { $_ -match '^SUPABASE_ACCESS_TOKEN=' }
if (-not $line) { Write-Error "SUPABASE_ACCESS_TOKEN not found in $envPath"; exit 1 }
$token = ($line -replace '^SUPABASE_ACCESS_TOKEN=', '').Trim()

$orgId = "mhaugpcyrrvpbccwksvj"
$body = @{
  organization_id = $orgId
  name            = "q-reil"
  region          = "us-east-1"
  db_pass         = "Qr3il_Supabase_2026_Secure!"
} | ConvertTo-Json

$headers = @{
  "Authorization" = "Bearer $token"
  "Content-Type"  = "application/json"
}

try {
  $response = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects" -Method Post -Headers $headers -Body $body
  Write-Host "Project created. Ref: $($response.id)"
  $response | ConvertTo-Json -Depth 5
} catch {
  Write-Host "Error: $($_.Exception.Message)"
  if ($_.Exception.Response) {
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $reader.BaseStream.Position = 0
    Write-Host $reader.ReadToEnd()
  }
  exit 1
}
