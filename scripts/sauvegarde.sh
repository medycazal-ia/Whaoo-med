#!/usr/bin/env bash
# Crée une sauvegarde complète et versionnée de whaoo, en deux archives
# (l'envoi de fichiers à Medy est limité à 30 Mo par fichier) :
#   - whaoo-vX.Y-AAAA-MM-JJ.zip : le code complet et fonctionnel, la notice
#     de restauration, le journal des versions et les extras ;
#   - whaoo-vX.Y-AAAA-MM-JJ-historique-git.zip (+ .z01, .z02… si besoin) :
#     tout l'historique Git (bundle), découpé en volumes de 25 Mo.
#
# Usage : scripts/sauvegarde.sh [dossier-de-sortie] [dossier-extras]
#   dossier-de-sortie  où écrire le zip (défaut : ../sauvegardes-whaoo)
#   dossier-extras     facultatif, copié tel quel dans le zip sous extras/
#                      (fichiers hors dépôt, sans secrets : historique…)
#
# La version est celle de l'entrée la plus récente (la première) de
# sauvegardes/SAUVEGARDES.md. Avant de lancer : ajouter cette entrée,
# committer avec le message « Sauvegarde vX.Y — AAAA-MM-JJ » et pousser.
# Ce commit est le point de restauration de la version sur GitHub (les tags
# ne peuvent pas être poussés depuis les sessions Claude) ; le script
# refuse un arbre de travail modifié pour que le zip lui corresponde.
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if [ -n "$(git status --porcelain)" ]; then
  echo "Arbre de travail modifié : committe et pousse d'abord." >&2
  exit 1
fi

entree=$(grep -m1 -E '^## v[0-9]+\.[0-9]+ — [0-9]{4}-[0-9]{2}-[0-9]{2}' sauvegardes/SAUVEGARDES.md || true)
if [ -z "$entree" ]; then
  echo "Aucune entrée « ## vX.Y — AAAA-MM-JJ » dans sauvegardes/SAUVEGARDES.md." >&2
  exit 1
fi
tag=$(echo "$entree" | cut -d' ' -f2)
date_jour=$(echo "$entree" | cut -d' ' -f4)
nom="whaoo-$tag-$date_jour"
sortie="${1:-../sauvegardes-whaoo}"
extras="${2:-}"
branche=$(git rev-parse --abbrev-ref HEAD)

# Tag local, inclus dans le bundle pour retrouver la version une fois
# l'historique restauré.
git tag -f -a "$tag" -m "whaoo $tag — sauvegarde du $date_jour" >/dev/null

travail=$(mktemp -d)
trap 'rm -rf "$travail"' EXIT
racine="$travail/$nom"
mkdir -p "$racine/application" "$travail/historique/$nom-historique-git"

# Code complet tel qu'il est au tag (fichiers suivis uniquement : jamais
# .env.local ni node_modules).
git archive "$tag" | tar -x -C "$racine/application"

# Tout l'historique : la branche de travail et les tags de version.
git bundle create "$travail/historique/$nom-historique-git/whaoo.bundle" HEAD "$branche" --tags 2>/dev/null

cp sauvegardes/RESTAURATION.md "$racine/LISEZ-MOI-RESTAURATION.md"
cp sauvegardes/SAUVEGARDES.md "$racine/JOURNAL-DES-VERSIONS.md"
{
  echo "Application : whaoo"
  echo "Version     : $tag"
  echo "Date        : $date_jour"
  echo "Branche     : $branche"
  echo "Commit      : $(git rev-parse "$tag^{commit}")"
} > "$racine/VERSION.txt"

if [ -n "$extras" ] && [ -d "$extras" ]; then
  cp -r "$extras" "$racine/extras"
fi

mkdir -p "$sortie"
sortie=$(cd "$sortie" && pwd)
rm -f "$sortie/$nom.zip" "$sortie/$nom-historique-git".z*
(cd "$travail" && zip -qr -9 "$sortie/$nom.zip" "$nom")
(cd "$travail/historique" && zip -qr -9 -s 25m "$sortie/$nom-historique-git.zip" "$nom-historique-git")

echo "Sauvegarde :"
ls -1sh "$sortie/$nom.zip" "$sortie/$nom-historique-git".z*
