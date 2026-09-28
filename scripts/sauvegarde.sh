#!/usr/bin/env bash
# Crée une sauvegarde complète et versionnée de whaoo :
#   - un tag Git annoté vX.Y (point de restauration exact, poussé sur GitHub) ;
#   - un zip daté whaoo-vX.Y-AAAA-MM-JJ.zip contenant le code complet, tout
#     l'historique Git (bundle), les livrables et la notice de restauration.
#
# Usage : scripts/sauvegarde.sh [version] [dossier-de-sortie] [dossier-extras]
#   version            ex. 1.3 — par défaut : dernier tag vX.Y + 0.1 (ou 1.0)
#   dossier-de-sortie  où écrire le zip (défaut : ../sauvegardes-whaoo)
#   dossier-extras     facultatif, copié tel quel dans le zip sous extras/
#                      (fichiers hors dépôt : historique de conversation…)
#
# Avant de lancer : ajouter l'entrée de la version dans
# sauvegardes/SAUVEGARDES.md, committer et pousser (le script refuse un
# arbre de travail modifié, pour que le zip corresponde exactement au tag).
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if [ -n "$(git status --porcelain)" ]; then
  echo "Arbre de travail modifié : committe et pousse d'abord." >&2
  exit 1
fi

dernier=$(git tag --list 'v[0-9]*.[0-9]*' --sort=-v:refname | head -n1)
if [ -n "${1:-}" ]; then
  version="$1"
elif [ -z "$dernier" ]; then
  version="1.0"
else
  majeur=${dernier#v}; majeur=${majeur%%.*}
  mineur=${dernier##*.}
  version="$majeur.$((mineur + 1))"
fi

tag="v$version"
date_jour=$(date +%F)
nom="whaoo-$tag-$date_jour"
sortie="${2:-../sauvegardes-whaoo}"
extras="${3:-}"
branche=$(git rev-parse --abbrev-ref HEAD)

if git rev-parse -q --verify "refs/tags/$tag" >/dev/null; then
  echo "Le tag $tag existe déjà." >&2
  exit 1
fi
if ! grep -q "^## $tag " sauvegardes/SAUVEGARDES.md; then
  echo "Ajoute d'abord l'entrée « ## $tag — $date_jour » dans sauvegardes/SAUVEGARDES.md." >&2
  exit 1
fi

git tag -a "$tag" -m "whaoo $tag — sauvegarde du $date_jour"

travail=$(mktemp -d)
trap 'rm -rf "$travail"' EXIT
racine="$travail/$nom"
mkdir -p "$racine/application" "$racine/historique-git"

# Code complet tel qu'il est au tag (fichiers suivis uniquement : jamais
# .env.local ni node_modules).
git archive "$tag" | tar -x -C "$racine/application"

# Tout l'historique : la branche de travail, la branche par défaut si elle
# existe, et tous les tags de version.
git bundle create "$racine/historique-git/whaoo.bundle" "$branche" --tags 2>/dev/null

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
(cd "$travail" && zip -qr -9 "$sortie/$nom.zip" "$nom")

echo "Tag créé   : $tag (à pousser : git push origin $tag)"
echo "Sauvegarde : $sortie/$nom.zip ($(du -h "$sortie/$nom.zip" | cut -f1))"
