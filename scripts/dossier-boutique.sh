#!/usr/bin/env bash
# Génère livrables/boutique/whaoo-dossier-boutique-vX.Y-AAAA-MM-JJ.pdf (version
# et date lues dans livrables/boutique/VERSIONS.md). Nécessite Playwright et
# Chromium (présents dans les sessions Claude ; ailleurs :
# npm i -g playwright && npx playwright install chromium).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
NODE_PATH="$(npm root -g)${NODE_PATH:+:$NODE_PATH}" node scripts/dossier-boutique.cjs
