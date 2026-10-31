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

## 2 bis. Vidéos de leçon — Cloudinary

Les vidéos s'envoient depuis l'éditeur de formation (icône ▶ d'une leçon → « Envoyer un
fichier ») : le navigateur envoie le fichier **directement** à Cloudinary, par morceaux de 20 Mo
(reprise automatique en cas de coupure), avec une signature délivrée par l'API. Le secret ne
quitte jamais le serveur. Les vidéos sont stockées en type « authenticated » : lisibles
uniquement via une URL signée émise par l'API (inscrits, ou tout le monde pour une vidéo en
accès libre). Durée lue automatiquement chez Cloudinary.

1. Tableau de bord Cloudinary → **Settings → API Keys** : relever *Cloud name*, *API Key*,
   *API Secret*.
2. Render → service backend → **Environment** : ajouter

| Variable | Valeur |
|---|---|
| `CLOUDINARY_CLOUD_NAME` | cloud name |
| `CLOUDINARY_API_KEY` | API key |
| `CLOUDINARY_API_SECRET` | API secret (jamais côté frontend, jamais dans Git) |
| `CLOUDINARY_FOLDER` | facultatif, défaut `mouslih-academy` |

3. En local : mêmes variables dans `.env`, puis `pnpm cloudinary:check` (teste la connexion,
   affiche l'offre et la taille maximale d'une vidéo, sans afficher le secret).

Sans ces variables, l'admin ne propose que les liens YouTube : rien ne casse.

**À savoir** : après l'envoi, Cloudinary prépare la vidéo (rendu MP4 ≤ 1280 px et image
d'aperçu) en quelques minutes ; l'éditeur affiche « En préparation » et se met à jour seul.
Sur les offres standard, une URL signée n'expire pas (un inscrit pourrait la partager) ;
l'expiration demande l'option « token-based authentication » des offres avancées. Remplacer
ou passer une leçon sur YouTube supprime l'ancienne vidéo chez Cloudinary.

## 2 ter. E-mails — SMTP

Le site envoie l'e-mail « Votre accès est prêt » (FR/EN/AR) après chaque paiement confirmé.
N'importe quel fournisseur SMTP convient. Render → service backend → **Environment** :

| Variable | Exemple |
|---|---|
| `SMTP_HOST` | `smtp-relay.brevo.com` · `smtp.gmail.com` · `smtp.resend.com` |
| `SMTP_PORT` | `587` (STARTTLS) ou `465` (SSL) |
| `SMTP_USER` | identifiant SMTP du fournisseur |
| `SMTP_PASSWORD` | mot de passe / clé SMTP (Gmail : « mot de passe d'application ») |
| `SMTP_FROM` | `Mouslih Academy <contact@votre-domaine>` — adresse validée chez le fournisseur |
| `FRONTEND_URL` | `https://mouslih-academy.vercel.app` (lien des e-mails et retours Wave) |

En local : mêmes variables dans `.env`, puis `pnpm email:check` (connexion) et
`pnpm email:check --to=vous@exemple.com` (envoie le vrai e-mail d'accès en essai). Sans ces
variables, l'API journalise l'e-mail au lieu de l'envoyer : rien ne casse. Un échec d'envoi
n'annule jamais la confirmation d'un paiement.

## 3. Données de démonstration (optionnel — jamais en production ouverte)

Pour peupler la base Neon avec le catalogue de démo (formations, enseignant, témoignages) :
lancer `DATABASE_URL="<chaîne Neon>" pnpm prisma:seed` depuis un poste ayant accès à la base
(en local, ou via le Shell Render si disponible sur votre plan).

## 3 bis. Contenu « Rectifiez votre Fâtiḥah » en production (recommandé)

Met la base de production à jour avec la formation (10 150 F, textes FR/EN/AR, 5 vidéos,
10 erreurs) et masque les autres formations, **sans créer aucune donnée de démo** (ni compte,
ni commande, ni témoignage). Relançable sans risque ; préserve la couverture et les liens
vidéo déjà saisis depuis l'admin. Supprime l'ancien programme de la formation (et la
progression qui y était rattachée).

```bash
DATABASE_URL="<chaîne Neon directe>" pnpm prisma:sync-fatiha           # aperçu, n'écrit rien
DATABASE_URL="<chaîne Neon directe>" pnpm prisma:sync-fatiha --apply   # applique
```

À lancer **après** le redéploiement Render (les migrations doivent être appliquées). Si
l'aperçu signale le compte `admin@mouslihacademy.sn`, c'est qu'un seed de démo a déjà tourné
sur cette base : changer son mot de passe (`password123`) ou le supprimer avant l'ouverture
au public.

## 3 ter. Sécuriser la production avant l'ouverture au public

Si un seed de démo a tourné sur la base de production, le compte `admin@mouslihacademy.sn`
y existe avec le mot de passe `password123`, ainsi que des comptes, commandes et témoignages
fictifs. À traiter **avant** d'ouvrir le site :

```bash
DATABASE_URL="<chaîne Neon directe>" pnpm prisma:secure-production                 # aperçu
DATABASE_URL="<chaîne Neon directe>" pnpm prisma:secure-production --apply \
  --purge-demo --admin-email=<adresse réelle de l'admin>                              # applique
```

- Le nouveau mot de passe est demandé au clavier, sans s'afficher (12 caractères minimum,
  lettres et chiffres) ; toutes les sessions du compte admin sont fermées.
- `--purge-demo` supprime uniquement les comptes du seed (identifiant **et** adresse doivent
  correspondre), leurs commandes et les 6 témoignages fictifs. Aucun vrai compte, aucune
  formation n'est touché.
- `--admin-email` (facultatif) remplace l'adresse de connexion du compte admin.

## 4. Après le déploiement du frontend

Une fois l'URL Vercel définitive connue, revenir ici mettre à jour `CORS_ORIGIN` et
`FRONTEND_URL`, puis redéployer (Render redéploie automatiquement à chaque changement de
variable d'environnement).
