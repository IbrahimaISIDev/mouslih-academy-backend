# Mouslih Academy — backend

API NestJS + PostgreSQL/Prisma pour la plateforme Mouslih Academy. Ce dépôt implémente le
contrat documenté dans `BACKEND.md` et `DATA-MODEL.md` du frontend
([mouslih-academy](https://github.com/IbrahimaISIDev/mouslih-academy)) — aucun composant
frontend n'a besoin d'être modifié pour brancher cette API, seul le point de bascule
`NEXT_PUBLIC_USE_MOCKS=false` change.

## Installation

Prérequis : Node 22+, [pnpm](https://pnpm.io) 10+, Docker (pour PostgreSQL en local).

```bash
pnpm install
docker compose up -d        # PostgreSQL local, port 5434
cp .env.example .env        # ajuster si besoin
pnpm prisma:migrate         # applique le schéma
pnpm prisma:seed            # données de démo (mêmes données que src/mocks/ du frontend)
pnpm start:dev
```

L'API démarre sur `http://localhost:3001/api`.

## Scripts

| Commande | Effet |
|---|---|
| `pnpm start:dev` | Serveur de développement (watch) |
| `pnpm build` | Build de production |
| `pnpm start:prod` | Sert le build de production |
| `pnpm lint` | oxlint |
| `pnpm test` / `pnpm test:e2e` | Tests unitaires / bout en bout (Vitest) |
| `pnpm prisma:migrate` | Applique les migrations Prisma en développement |
| `pnpm prisma:generate` | Régénère le client Prisma (`src/generated/prisma`) |
| `pnpm prisma:studio` | Interface d'exploration de la base |
| `pnpm prisma:seed` | Réinjecte les données de démo |

## Stack

NestJS 12 (ESM) · TypeScript · PostgreSQL · Prisma 7 (adaptateur `@prisma/adapter-pg`) ·
JWT (access + refresh) · Vitest.

Comptes de démo créés par le seed (mot de passe `password123`) :
- `aminata.diallo@exemple.sn` — apprenante avec formations en cours et terminées
- `oustaz.mouslih@mouslihacademy.sn` — enseignant (correction de récitations)
- `admin@mouslihacademy.sn` — administrateur

## Vidéo

Aperçus gratuits (`isFreePreview: true`) servis via YouTube (embarqué directement, aucun
contrôle d'accès nécessaire). Leçons payantes servies via Cloudflare Stream, avec URL de
lecture signée générée côté serveur après vérification d'inscription — voir `src/videos`.

## Paiement Wave

`OrdersModule` s'appuie sur une interface `WavePaymentProvider`, implémentée aujourd'hui par un
stub (redirige vers notre propre écran de confirmation). Brancher les identifiants marchand
Wave réels changera cette seule classe, sans toucher au reste du module.
