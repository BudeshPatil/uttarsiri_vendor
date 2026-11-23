#!/usr/bin/env bash
# Staging deploy for the Dream Home website. Run on the server from the repo root.
set -euo pipefail
cd "$(dirname "$0")"

[ -f .env.staging ] || { echo "ERROR: .env.staging is missing. Copy .env.example to .env.staging and fill it in."; exit 1; }

echo "==> git pull"
git pull --ff-only

echo "==> npm ci"
npm ci

echo "==> build (bakes NEXT_PUBLIC_* from .env.staging)"
npm run build:staging

echo "==> restart pm2"
if pm2 describe dh-website >/dev/null 2>&1; then
  pm2 reload dh-website --update-env
else
  pm2 start ecosystem.config.cjs
fi
pm2 save

echo "==> health check"
sleep 4
curl -fsS -o /dev/null -w "website HTTP %{http_code}\n" http://127.0.0.1:4216/