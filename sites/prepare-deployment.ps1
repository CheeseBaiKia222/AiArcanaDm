param(
  [Parameter(Mandatory=$true)][string]$SitesPluginRoot,
  [string]$ArchivePath = (Join-Path $PSScriptRoot 'outputs\parcarna-deploy.tar.gz'),
  [switch]$SkipInstall
)
$ErrorActionPreference = 'Stop'
Push-Location $PSScriptRoot
try {
  $ArchivePath = [IO.Path]::GetFullPath($ArchivePath)
  New-Item -ItemType Directory -Force -Path (Split-Path $ArchivePath) | Out-Null
  $env:npm_config_cache = Join-Path $PSScriptRoot '.sites-runtime\npm-cache'
  if (-not $SkipInstall) {
    node (Join-Path $SitesPluginRoot 'scripts\install-dependencies.mjs')
    if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed.' }
  }
  node --test tests/concurrency.test.mjs tests/game.test.mjs tests/server.test.mjs
  if ($LASTEXITCODE -ne 0) { throw 'Tests failed.' }
  node (Join-Path $SitesPluginRoot 'scripts\build-site.mjs')
  if ($LASTEXITCODE -ne 0) { throw 'Build failed.' }
  node scripts/package-deployment.mjs $ArchivePath
  if ($LASTEXITCODE -ne 0) { throw 'Packaging failed.' }
  Write-Output "Deployment archive: $ArchivePath"
  Write-Output 'Publish through Sites using the matching pushed source commit. This script does not change site access.'
} finally { Pop-Location }
