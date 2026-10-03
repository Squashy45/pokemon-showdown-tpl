#!/usr/bin/env bash
set -euo pipefail

client_dir=/root/pokemon-showdown-client
client_branch=six-player-client
client_remote=https://github.com/Squashy45/pokemon-showdown-tpl.git

if [[ -d "$client_dir/.git" ]]; then
	git -C "$client_dir" pull --ff-only origin "$client_branch"
else
	git clone --single-branch --branch "$client_branch" "$client_remote" "$client_dir"
fi

cd "$client_dir"
if [[ ! -d node_modules ]]; then
	npm install
fi
cp config/config-example.js config/config.js
cat config/tpl-config.js >> config/config.js
node build

pm2 delete tpl-client >/dev/null 2>&1 || true
pm2 start tpl-static-server.mjs --name tpl-client -- 8081
pm2 save
pm2 status

echo "TPL client: http://144.126.207.98:8081/"
