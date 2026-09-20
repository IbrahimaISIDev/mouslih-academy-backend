# Déploiement — Render + Neon

Ce guide suppose que le frontend est déployé séparément sur Vercel (voir
`../mouslih-academy-frontend/DEPLOYMENT.md`). Les deux déploiements se référencent l'un
l'autre par URL : le plus simple est de déployer d'abord cette API, puis le frontend avec
l'URL obtenue, puis de revenir ici mettre à jour `CORS_ORIGIN` et `FRONTEND_URL` avec l'URL
finale du frontend.

## 1. Base de données — Neon

1. Créer un projet sur [neon.tech](https://neon.tech).
2. Dans l'onglet **Connection Details**, copier la chaîne **directe** (celle dont l'hôte ne
   contient **pas** `-pooler`) — ce service tourne en process long sur Render, pas en
   serverless, le pooling PgBouncer de Neon n'apporte rien ici et complique inutilement
   `prisma migrate deploy` (verrous consultatifs). La chaîne inclut déjà `sslmode=require`,
   à garder telle quelle.
3. Garder cette chaîne sous la main pour l'étape suivante (`DATABASE_URL`).

## 2. API — Render

### Option A — Blueprint (le plus rapide)

Le dépôt contient un `render.yaml` : sur Render, **New +** → **Blueprint**, pointer ce dépôt.
Render crée le service avec les bonnes commandes de build/démarrage et vous invite à remplir
chaque variable ci-dessous (celles marquées `sync: false` dans le fichier).

### Option B — Web Service manuel

**New +** → **Web Service**, pointer ce dépôt, puis :

| Champ | Valeur |
|---|---|
| Runtime | Node |
| Build Command | `corepack enable && pnpm install --frozen-lockfile && pnpm prisma generate && pnpm run build` |
| Start Command | `pnpm prisma migrate deploy && pnpm run start:prod` |
| Health Check Path | `/api` |

(`prisma migrate deploy` est idempotent — l'exécuter à chaque démarrage est sans risque et
garantit que les migrations en attente sont toujours appliquées avant que l'app ne serve du
trafic.)

### Variables d'environnement

Voir `.env.example` pour le détail de chacune. Résumé de ce qui est **requis** pour un
fonctionnement de base (le reste — Cloudflare, Wave, SMTP — est optionnel : en leur absence,
les fonctionnalités concernées se dégradent proprement en mode stub/no-op, déjà le
comportement en local) :

- `DATABASE_URL` — chaîne Neon directe de l'étape 1.
- `CORS_ORIGIN` — URL du frontend Vercel (ex. `https://mouslih-academy.vercel.app`). Plusieurs
  origines possibles, séparées par des virgules.
- `PUBLIC_URL` — URL publique de ce service Render lui-même (ex.
  `https://mouslih-academy-backend.onrender.com`).
- `FRONTEND_URL` — même valeur que `CORS_ORIGIN` (utilisée pour les liens dans les e-mails et
  les redirections Wave).
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — générées automatiquement par le Blueprint
  (`generateValue: true`) ; à renseigner à la main en Option B (n'importe quelle chaîne
  aléatoire longue, par ex. `openssl rand -hex 32`).

### Stockage des couvertures de formation — point d'attention

Les couvertures uploadées depuis l'éditeur admin sont actuellement stockées sur le disque
local du service (`UPLOADS_DIR`, `./uploads` par défaut) et servies sur `/uploads/*`. **Le
système de fichiers de Render est éphémère** : sans disque persistant, ces fichiers
disparaissent au redéploiement suivant. Deux options :

1. **Disque persistant Render** (le plus simple, aucun changement de code) : onglet **Disks**
   du service → ajouter un disque, monté par ex. sur `/var/data` → régler `UPLOADS_DIR` sur
   `/var/data/uploads`.
2. **Migrer vers Cloudflare R2** (déjà câblé pour les ressources de leçon, voir `src/media`) —
   plus de travail, mais cohérent avec le reste du stockage objet et sans limite de taille de
   disque.

Sans l'une des deux, le catalogue de démo (couvertures fournies dans le dépôt frontend)
continue de fonctionner normalement — seul un nouvel upload depuis l'éditeur admin serait
perdu au prochain déploiement.

## 3. Données de démonstration (optionnel)

Pour peupler la base Neon avec le catalogue de démo (formations, enseignant, témoignages) :
lancer `DATABASE_URL="<chaîne Neon>" pnpm prisma:seed` depuis un poste ayant accès à la base
(en local, ou via le Shell Render si disponible sur votre plan).

## 4. Après le déploiement du frontend

Une fois l'URL Vercel définitive connue, revenir ici mettre à jour `CORS_ORIGIN` et
`FRONTEND_URL`, puis redéployer (Render redéploie automatiquement à chaque changement de
variable d'environnement).
