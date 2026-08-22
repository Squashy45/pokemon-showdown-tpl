#!/usr/bin/env bash
set -euo pipefail

cd /root/pokemon-showdown

git pull tpl main
node build
pm2 restart showdown --update-env
pm2 save

pm2 status
