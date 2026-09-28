# Restaurer whaoo à partir de cette sauvegarde

La sauvegarde tient en deux archives :

- `whaoo-vX.Y-AAAA-MM-JJ.zip` : **l'application complète et
  fonctionnelle**. Elle suffit à tout réinstaller.
- `whaoo-vX.Y-AAAA-MM-JJ-historique-git.zip` : tout l'historique Git (chaque
  modification depuis le début). Il peut être découpé en plusieurs volumes
  (`.z01`, `.z02`…) : les garder dans le même dossier et ouvrir le `.zip`
  avec 7-Zip (Windows) ou The Unarchiver (Mac). En ligne de commande :
  `zip -s 0 archive.zip --out complet.zip && unzip complet.zip`.
  L'historique est aussi conservé sur GitHub.

Contenu du premier zip :

| Dossier / fichier | Contenu |
|---|---|
| `application/` | Le code complet de l'application à cette version (prêt à installer). |
| `VERSION.txt` | Numéro de version, date et commit exact. |
| `JOURNAL-DES-VERSIONS.md` | Ce qui a été fait dans chaque version. |
| `extras/` (si présent) | Fichiers hors code : historique de conversation, etc. |

Les **clés secrètes ne sont jamais dans la sauvegarde** (elles restent sur
Render et dans les comptes Supabase, OpenAI, ElevenLabs…). Il faudra les
renseigner à nouveau (voir étape 3).

## 1. Récupérer le code avec tout son historique (recommandé)

Une fois l'archive d'historique extraite :

```bash
git clone whaoo-vX.Y-AAAA-MM-JJ-historique-git/whaoo.bundle whaoo
cd whaoo
git checkout claude/whaoo-med-specs-8xx0r4
```

Pour republier sur un nouveau dépôt GitHub :

```bash
git remote set-url origin https://github.com/<compte>/<depot>.git
git push -u origin --all && git push origin --tags
```

Sinon, le dossier `application/` suffit pour lancer l'appli sans historique.

## 2. Installer et lancer en local

Il faut Node.js 20 ou plus récent.

```bash
npm install
cp .env.example .env.local   # puis remplir les valeurs (étape 3)
npm run dev                  # http://localhost:3000
```

## 3. Variables d'environnement

La liste complète, commentée, est dans `.env.example`. Au minimum :
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`. Les autres (OpenAI,
Anthropic, ElevenLabs, VAPID, ADMIN_EMAILS, ADMIN_PASSWORD…) activent chacune
une fonctionnalité précise et l'appli fonctionne sans elles.

## 4. Base de données (nouvelle base Supabase uniquement)

Si la base Supabase d'origine existe toujours, rien à faire. Pour une base
neuve, exécuter dans l'ordre, dans Supabase → SQL Editor, chaque fichier de
`supabase/migrations/` (0001 à la plus récente).

## 5. Remettre en ligne

Le fichier `render.yaml` décrit le service Render : créer un service
« Web » relié au dépôt GitHub, branche `claude/whaoo-med-specs-8xx0r4`,
puis reporter les variables d'environnement.
