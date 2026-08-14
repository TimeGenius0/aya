# Aya Handous — Cabinet vétérinaire

Application de gestion pour un cabinet vétérinaire à deux utilisatrices :
clients, animaux, notes de traitement, calendrier de consultations et
facturation. Accessible sur mobile et web, installable comme une application
(PWA), et exposée en MCP pour un assistant IA.

## Stack

- **Next.js** (App Router pour les pages, Pages Router pour `/api/mcp` —
  requis pour la compatibilité avec le SDK MCP) + TypeScript + Tailwind CSS
- **Supabase** — base de données Postgres, authentification (mot de passe +
  lien magique), stockage de fichiers
- **Resend** — envoi des e-mails d'authentification (via SMTP personnalisé
  configuré dans Supabase, aucun code applicatif)
- **Prisma** — accès typé à la base (le schéma canonique reste le SQL exécuté
  à la main dans Supabase, voir le guide de mise en route)
- **@react-pdf/renderer** — génération des factures PDF
- **@modelcontextprotocol/sdk** — serveur MCP exposant les dossiers du
  cabinet à un client IA
- **FullCalendar** — vue calendrier des consultations

## Démarrage local

1. Suivre le guide de mise en route (checklist des comptes GitHub, Supabase,
   Resend, Vercel — remis séparément) pour créer un projet Supabase et
   récupérer les clés.
2. Copier `.env.local.example` vers `.env.local` et renseigner les valeurs.
3. Installer les dépendances puis lancer le serveur de développement :

   ```bash
   npm install
   npx prisma generate
   npm run dev
   ```

4. Ouvrir [http://localhost:3000](http://localhost:3000).

## Commandes

- `npm run dev` — serveur de développement
- `npm run build` — build de production (type-check inclus)
- `npm start` — sert le build de production
- `npm run lint` — ESLint
- `npm run prisma:generate` — régénère le client Prisma après une
  modification de `prisma/schema.prisma`

## Déploiement

Hébergé gratuitement sur Vercel (voir le guide de mise en route pour la
checklist complète : variables d'environnement, redirection Supabase vers
l'adresse `*.vercel.app`, etc.).

## MCP

Une fois l'app en ligne, générer une clé depuis **Réglages → Clés MCP**, puis
configurer un client MCP compatible avec l'URL `https://<votre-app>.vercel.app/api/mcp`
et un en-tête `Authorization: Bearer <clé>`.
