param(
	[string]$Message = "Update TPL server config"
)

$ErrorActionPreference = "Stop"

$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo

git -c safe.directory="$repo" add -A

$status = git -c safe.directory="$repo" status --porcelain
if (-not $status) {
	Write-Host "No config changes to push."
	exit 0
}

git -c safe.directory="$repo" commit -m $Message
git -c safe.directory="$repo" push tpl master:main

Write-Host "Pushed TPL config changes to GitHub."
