param(
	[string]$HostName = "root@144.126.207.98",
	[string]$LogPath = "/root/pokemon-showdown/logs/private-inputs.jsonl"
)

$ErrorActionPreference = "Stop"

Write-Host "Watching private battle inputs on $HostName"
Write-Host "Press Ctrl+C to stop."

ssh $HostName "mkdir -p /root/pokemon-showdown/logs && touch $LogPath && tail -f $LogPath"
