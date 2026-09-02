param(
	[string]$HostName = "root@144.126.207.98",
	[string]$LogPath = "/root/pokemon-showdown/logs/private-inputs.jsonl",
	[int]$Lines = 20
)

$ErrorActionPreference = "Stop"

Write-Host "Watching private battle inputs on $HostName"
Write-Host "Press Ctrl+C to stop."

ssh $HostName "cd /root/pokemon-showdown && mkdir -p logs && touch $LogPath && tail -n $Lines -f $LogPath | node scripts/tpl-format-private-inputs.mjs"
