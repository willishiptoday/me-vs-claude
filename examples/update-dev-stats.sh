#!/usr/bin/env bash
# Reference daily updater for me-vs-claude. Regenerates dev-stats.json from local logs,
# and only commits + deploys when the data actually changed. Adapt paths + deploy command
# to your setup, then wire it to launchd/cron. See the README.
set -euo pipefail

cd "$(dirname "$0")/.."          # repo root

OUT="public/dev-stats.json"
LEDGER="me-vs-claude-ledger.json"
CONFIG="me-vs-claude.config.json"

# 1. Collect (npx once published; or `node path/to/bin/collect.mjs`)
npx --yes me-vs-claude collect --out "$OUT" --ledger "$LEDGER" --manual "$CONFIG"

# 2. Bail early if nothing changed (avoids empty commits / needless deploys)
if git diff --quiet -- "$OUT" "$LEDGER"; then
  echo "me-vs-claude: no change, skipping deploy"
  exit 0
fi

# 3. Commit + push
git add "$OUT" "$LEDGER"
git commit -m "chore: refresh dev stats ($(date +%Y-%m-%d))"
git push

# 4. Build + deploy (swap for your host)
npm run build
npx wrangler deploy
echo "me-vs-claude: deployed"
