# Mise en route — quatre comptes gratuits, un cabinet en ligne

Avant que le code ne serve à quelque chose, il faut un endroit où le faire
tourner. Ce guide crée les quatre comptes gratuits nécessaires — GitHub,
Supabase, Resend, Vercel — et les relie entre eux. Comptez 40 à 55 minutes,
aucune carte bancaire requise.

Dans l'ordre :

- **[A. GitHub](#a-github)** — héberger le code source
- **[B. Supabase](#b-supabase)** — base de données, comptes, fichiers, e-mails
- **[C. Vercel](#c-vercel)** — mettre le site en ligne
- **[D. Rebouclage](#d-rebouclage)** — connecter Supabase à l'adresse finale
- **[E. Vérification](#e-verification)** — tester avant de fermer l'onglet
- **[F. Connecteur MCP (OAuth)](#f-connecteur-mcp-oauth--pour-claudeai)** — pour claude.ai, si besoin

---

## A. GitHub

*Le code source · gratuit · ~5 min*

1. **Créer le compte** — Sur [github.com/signup](https://github.com/signup),
   inscrivez-vous avec l'adresse e-mail du cabinet. Le plan gratuit suffit
   largement.
2. **Créer le dépôt** — Cliquez **New repository**. Nom : `ayahandous`.
   Visibilité : **Private** — le dépôt contiendra à terme des données de
   clients, il ne doit pas être public. Ne cochez aucune case
   d'initialisation (pas de README, pas de .gitignore) : le projet en
   apporte déjà.
3. **Rien d'autre pour l'instant** — Une fois le code écrit et testé
   localement, il est poussé vers ce dépôt avec quelques commandes `git`.
   *(Déjà fait : ce dépôt est `git@github.com:TimeGenius0/aya.git`, branche
   `main`.)*

---

## B. Supabase

*Base de données · authentification · fichiers · gratuit · ~30 min*

1. **Créer le projet** — Sur [supabase.com](https://supabase.com),
   inscrivez-vous puis **New project**. Région conseillée : Europe (Paris ou
   Frankfurt) pour la latence la plus faible depuis la Tunisie. Choisissez
   un mot de passe de base de données et conservez-le — il ne sert qu'en
   secours, l'app ne s'en sert pas au quotidien.

2. **Récupérer les clés** — Une fois le projet prêt (1-2 min), allez dans
   **Project Settings → API**. Notez de côté :
   - `Project URL`
   - la clé publique (`anon public`, ou sur les projets récents
     `sb_publishable_...`)
   - la clé secrète (`service_role`, ou sur les projets récents
     `sb_secret_...` — bouton "Reveal"). Cette dernière est un secret
     complet — elle ne sera jamais mise dans le navigateur, uniquement dans
     la configuration serveur.

3. **Exécuter le schéma** — Ouvrez **SQL Editor → New query**, collez le
   script ci-dessous en entier, puis **Run**. Il crée les tables de
   l'application (clients, animaux, notes, consultations, factures,
   réglages du cabinet, clés MCP…) et leurs règles d'accès.

   ```sql
   -- extension nécessaire pour générer des identifiants uuid
   create extension if not exists pgcrypto;

   create table public.staff (
     id uuid primary key references auth.users(id) on delete cascade,
     full_name text not null,
     role text not null default 'assistant' check (role in ('owner','assistant')),
     created_at timestamptz not null default now()
   );

   create table public.clients (
     id uuid primary key default gen_random_uuid(),
     full_name text not null,
     phone text,
     email text,
     address text,
     notes text,
     created_by uuid references public.staff(id),
     created_at timestamptz not null default now(),
     updated_at timestamptz not null default now()
   );

   create table public.animals (
     id uuid primary key default gen_random_uuid(),
     client_id uuid not null references public.clients(id) on delete cascade,
     name text not null,
     species text not null,
     breed text,
     sex text,
     birthdate date,
     approx_age_years numeric,
     weight_kg numeric,
     notes text,
     attributes jsonb not null default '{}'::jsonb,
     created_at timestamptz not null default now(),
     updated_at timestamptz not null default now()
   );

   create table public.consultations (
     id uuid primary key default gen_random_uuid(),
     client_id uuid not null references public.clients(id),
     animal_id uuid not null references public.animals(id),
     scheduled_at timestamptz not null,
     duration_minutes int not null default 30,
     reason text,
     status text not null default 'planifie'
       check (status in ('planifie','confirme','termine','annule','absent')),
     created_by uuid references public.staff(id),
     created_at timestamptz not null default now(),
     updated_at timestamptz not null default now()
   );

   create table public.notes (
     id uuid primary key default gen_random_uuid(),
     animal_id uuid not null references public.animals(id),
     consultation_id uuid references public.consultations(id),
     author_id uuid references public.staff(id),
     free_text text,
     created_at timestamptz not null default now(),
     updated_at timestamptz not null default now()
   );

   create table public.note_line_items (
     id uuid primary key default gen_random_uuid(),
     note_id uuid not null references public.notes(id) on delete cascade,
     kind text not null check (kind in ('traitement','produit','acte')),
     description text not null,
     quantity numeric not null default 1,
     unit_price numeric not null default 0,
     sort_order int not null default 0
   );

   create sequence public.invoice_number_seq start 1;

   create or replace function public.generate_invoice_number()
   returns text language sql as $$
     select to_char(now(), 'YYYY') || '-' || lpad(nextval('public.invoice_number_seq')::text, 4, '0');
   $$;

   create table public.invoices (
     id uuid primary key default gen_random_uuid(),
     invoice_number text not null unique default public.generate_invoice_number(),
     client_id uuid not null references public.clients(id),
     animal_id uuid references public.animals(id),
     consultation_id uuid references public.consultations(id),
     note_id uuid references public.notes(id),
     currency text not null default 'TND',
     subtotal numeric not null default 0,
     tax_rate numeric not null default 0,
     tax_amount numeric not null default 0,
     total numeric not null default 0,
     status text not null default 'brouillon'
       check (status in ('brouillon','emise','payee','annulee')),
     issued_at timestamptz not null default now(),
     pdf_path text,
     created_by uuid references public.staff(id),
     created_at timestamptz not null default now()
   );

   create table public.invoice_line_items (
     id uuid primary key default gen_random_uuid(),
     invoice_id uuid not null references public.invoices(id) on delete cascade,
     description text not null,
     quantity numeric not null default 1,
     unit_price numeric not null default 0,
     line_total numeric not null default 0,
     sort_order int not null default 0
   );

   -- en-tête utilisée sur les factures générées (une seule ligne, modifiable
   -- depuis la page Réglages une fois l'app en ligne)
   create table public.clinic_settings (
     id int primary key default 1 check (id = 1),
     name text not null default 'Dr. Aya Handous',
     address text,
     phone text,
     email text,
     default_tax_rate numeric not null default 0,
     updated_at timestamptz not null default now()
   );
   insert into public.clinic_settings (id) values (1);

   -- clés MCP : jamais lues par un utilisateur connecté, seulement par le serveur
   create table public.api_keys (
     id uuid primary key default gen_random_uuid(),
     label text,
     key_hash text not null,
     staff_id uuid references public.staff(id),
     created_at timestamptz not null default now(),
     last_used_at timestamptz,
     revoked_at timestamptz
   );

   create index on public.animals (client_id);
   create index on public.consultations (client_id);
   create index on public.consultations (animal_id);
   create index on public.consultations (scheduled_at);
   create index on public.notes (animal_id);
   create index on public.note_line_items (note_id);
   create index on public.invoice_line_items (invoice_id);

   -- sécurité : seules les 2 personnes connectées (Aya + assistante) accèdent aux données
   alter table public.staff enable row level security;
   alter table public.clients enable row level security;
   alter table public.animals enable row level security;
   alter table public.consultations enable row level security;
   alter table public.notes enable row level security;
   alter table public.note_line_items enable row level security;
   alter table public.invoices enable row level security;
   alter table public.invoice_line_items enable row level security;
   alter table public.clinic_settings enable row level security;
   alter table public.api_keys enable row level security; -- aucune policy = accès service_role uniquement

   create policy "authenticated full access" on public.staff
     for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
   create policy "authenticated full access" on public.clients
     for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
   create policy "authenticated full access" on public.animals
     for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
   create policy "authenticated full access" on public.consultations
     for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
   create policy "authenticated full access" on public.notes
     for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
   create policy "authenticated full access" on public.note_line_items
     for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
   create policy "authenticated full access" on public.invoices
     for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
   create policy "authenticated full access" on public.invoice_line_items
     for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
   create policy "authenticated full access" on public.clinic_settings
     for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
   ```

4. **Créer le coffre à factures (optionnel)** — Les factures PDF sont
   générées à la volée à partir des données déjà en base — ce coffre n'est
   donc pas indispensable pour démarrer, mais le prévoir maintenant évite
   d'y revenir si un stockage des PDF est ajouté plus tard. Allez dans
   **Storage → New bucket**. Nom : `invoices`. Laissez-le en **Private**
   (surtout ne pas cocher "Public bucket"). Puis retournez dans **SQL
   Editor** et exécutez :

   ```sql
   create policy "authenticated read invoices" on storage.objects
     for select using (bucket_id = 'invoices' and auth.role() = 'authenticated');
   create policy "authenticated write invoices" on storage.objects
     for insert with check (bucket_id = 'invoices' and auth.role() = 'authenticated');
   create policy "authenticated update invoices" on storage.objects
     for update using (bucket_id = 'invoices' and auth.role() = 'authenticated');
   ```

5. **Fermer les inscriptions publiques** — Allez dans **Authentication →
   Providers → Email**. Désactivez **"Allow new users to sign up"**.
   L'application n'aura jamais de formulaire d'inscription : seuls les deux
   comptes créés à l'étape suivante pourront se connecter.

   > **Important** — Sans cette étape, n'importe qui devinant l'adresse du
   > site pourrait créer un compte et voir les dossiers des clients.

6. **Créer les deux comptes** — Toujours dans **Authentication → Users**,
   cliquez **Add user → Create new user**, une fois pour Aya et une fois
   pour l'assistante. Renseignez e-mail + mot de passe directement, et
   cochez **Auto Confirm User** (évite de déclencher un e-mail de
   confirmation ou d'invitation). Une fois créés, cliquez sur chaque
   utilisateur et copiez son `User UID`.

7. **Relier les comptes au cabinet** — Dans **SQL Editor**, remplacez les
   deux UID ci-dessous par ceux copiés à l'étape précédente, puis exécutez :

   ```sql
   insert into public.staff (id, full_name, role) values
     ('uid-de-aya', 'Aya Handous', 'owner'),
     ('uid-de-l-assistante', 'Nom de l''assistante', 'assistant');
   ```

8. **Brancher Resend pour l'envoi des e-mails** — Le service d'e-mail
   intégré à Supabase est très limité (quelques envois par heure) — trop
   peu pour des liens magiques fiables. [resend.com/signup](https://resend.com/signup)
   offre 3 000 e-mails/mois gratuits, sans carte bancaire. Une fois
   inscrite, allez dans **API Keys → Create API Key** et copiez la clé
   (elle ne sera montrée qu'une seule fois).

   Retournez sur Supabase, **Project Settings → Authentication → SMTP
   Settings**, activez **Enable Custom SMTP** et renseignez :

   | Champ | Valeur |
   |---|---|
   | Sender email | `onboarding@resend.dev` |
   | Sender name | Cabinet Aya Handous |
   | Host | `smtp.resend.com` |
   | Port | `587` |
   | Username | `resend` |
   | Password | la clé API Resend copiée à l'instant |

   > **Sans domaine** — `onboarding@resend.dev` est le domaine de test de
   > Resend : il envoie vers n'importe quelle adresse, sans qu'il soit
   > nécessaire de posséder ou de vérifier un nom de domaine. Si le cabinet
   > obtient un domaine un jour, il pourra être vérifié gratuitement dans
   > Resend pour envoyer depuis une adresse personnalisée — pas nécessaire
   > pour démarrer.

9. **Personnaliser l'e-mail du lien magique (optionnel)** — Dans
   **Authentication → Email Templates → Magic Link**, le texte peut être
   traduit en français. Non bloquant — l'app fonctionne avec le modèle par
   défaut, désormais délivré par Resend.

---

## C. Vercel

*Hébergement du site · gratuit · ~10 min*

1. **Créer le compte** — Sur [vercel.com/signup](https://vercel.com/signup),
   choisissez **Continue with GitHub** et autorisez l'accès — cela évite un
   mot de passe de plus et permet l'import direct du dépôt.
2. **Importer le dépôt** — Cliquez **Add New → Project**, puis sélectionnez
   `aya` (ou `ayahandous`, selon le nom du dépôt) dans la liste.
3. **Renseigner les variables d'environnement** — Avant de cliquer Deploy,
   ouvrez la section **Environment Variables** et ajoutez les cinq valeurs
   suivantes (récupérées en phase B — voir aussi `.env.local.example` à la
   racine du dépôt) :

   | Nom | Valeur |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | le `Project URL` de Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | la clé publique (`anon public` / `sb_publishable_...`) |
   | `SUPABASE_SERVICE_ROLE_KEY` | la clé secrète (`service_role` / `sb_secret_...`) — jamais côté navigateur |
   | `DATABASE_URL` | chaîne de connexion "Transaction pooler" (Settings → Database) |
   | `DIRECT_URL` | chaîne de connexion "Direct connection" (même page) |

4. **Déployer** — Cliquez **Deploy**. Après 1-2 minutes, Vercel attribue une
   adresse gratuite du type `aya.vercel.app` — c'est le site du cabinet,
   aucun nom de domaine à acheter.

---

## D. Rebouclage

*Connecter Supabase à l'adresse finale · ~3 min*

1. **Autoriser l'adresse Vercel** — Retournez sur Supabase,
   **Authentication → URL Configuration**. Réglez **Site URL** sur
   l'adresse `https://aya.vercel.app` obtenue à la phase C, et ajoutez la
   même adresse dans **Additional Redirect URLs** (gardez aussi
   `http://localhost:3000` pour les tests locaux).

   > **Pourquoi** — Sans cette étape, le lien magique reçu par e-mail
   > redirigera vers une page qui n'existe pas encore et la connexion
   > échouera.

---

## E. Vérification

*Avant de fermer l'onglet · ~5 min*

1. **Connexion par mot de passe** — Ouvrez l'adresse Vercel, connectez-vous
   avec l'e-mail et le mot de passe créés en phase B.
2. **Connexion par lien magique** — Déconnectez-vous, retentez avec
   "Envoyer un lien magique" sur le même e-mail, et vérifiez que le lien
   reçu ouvre bien le tableau de bord.
3. **Sur mobile** — Ouvrez la même adresse depuis un téléphone, puis
   "Ajouter à l'écran d'accueil" (Chrome Android) ou "Sur l'écran d'accueil"
   (Safari iOS) pour l'installer comme une application.
4. **Outils MCP (plus tard)** — Une clé pour connecter un assistant IA aux
   dossiers (créer/modifier clients, animaux, rendez-vous, factures) se
   génère depuis la page **Réglages** de l'app, une fois celle-ci en ligne.
   Rien à faire ici pour l'instant.

---

## F. Connecteur MCP (OAuth) — pour claude.ai

*Migration additionnelle · ~5 min · seulement si les phases A-E ont déjà été
faites une première fois*

L'app expose `/api/mcp`, utilisable de deux façons : une **clé API simple**
(Réglages → Clés MCP, pour la plupart des clients MCP), ou **OAuth** pour les
clients qui l'exigent — c'est le cas de claude.ai (« Add custom connector »,
qui ne propose que « None » ou « OAuth », pas de champ pour une clé). Avec
OAuth, claude.ai s'enregistre lui-même automatiquement (Dynamic Client
Registration) : **il n'y a jamais de Client ID ou de Client Secret à saisir
à la main.**

1. **Exécuter la migration** — Dans **SQL Editor**, exécutez ce script
   (additionnel au schéma de la phase B) :

   ```sql
   create table public.oauth_clients (
     id uuid primary key default gen_random_uuid(),
     client_id text not null unique,
     client_name text,
     redirect_uris text[] not null,
     created_at timestamptz not null default now()
   );

   create table public.oauth_authorization_codes (
     id uuid primary key default gen_random_uuid(),
     code_hash text not null unique,
     client_id text not null references public.oauth_clients(client_id) on delete cascade,
     redirect_uri text not null,
     code_challenge text not null,
     code_challenge_method text not null default 'S256',
     staff_id uuid not null references public.staff(id),
     expires_at timestamptz not null,
     used_at timestamptz,
     created_at timestamptz not null default now()
   );

   alter table public.oauth_clients enable row level security;
   alter table public.oauth_authorization_codes enable row level security;
   -- no policies on either — server-side (Prisma) access only, same posture as api_keys
   ```

2. **Ajouter le connecteur dans claude.ai** — Settings → Connectors → Add
   custom connector.
   - URL : `https://aya-nine-wheat.vercel.app/api/mcp`
   - Méthode d'authentification : **OAuth**
   - Laissez **Client ID** et **Client Secret** vides — claude.ai les
     obtient tout seul en s'enregistrant sur `/oauth/register` au premier
     appel.
3. **Se connecter et autoriser** — claude.ai ouvre un onglet vers
   `/oauth/authorize` ; connectez-vous (mot de passe ou lien magique) si ce
   n'est pas déjà fait, puis cliquez **Autoriser** sur l'écran de
   confirmation. claude.ai récupère ensuite un jeton automatiquement — ce
   jeton apparaît dans **Réglages → Clés MCP** sous le nom `OAuth: claude.ai`
   (ou le nom que claude.ai s'est donné), révocable comme n'importe quelle
   autre clé.

---

## Questions fréquentes

**Est-ce vraiment gratuit ?**
Oui pour ce volume d'usage : Supabase offre 500 Mo de base de données et
1 Go de fichiers, Vercel offre l'hébergement pour les projets personnels —
largement suffisant pour un cabinet à deux utilisatrices. Aucune carte
bancaire n'est demandée à l'inscription sur les deux plans gratuits.

**Le mot de passe de base de données choisi en phase B, à quoi sert-il ?**
Uniquement de secours (connexion directe à la base depuis un outil externe
si besoin un jour). Il n'est utilisé nulle part dans l'app au quotidien —
conservez-le simplement dans un gestionnaire de mots de passe.

**Et si je perds une des clés Supabase ?**
Elles restent visibles à tout moment dans Project Settings → API. Rien
n'est à usage unique dans cette phase (contrairement à la clé MCP générée
plus tard dans l'app, montrée une seule fois).

**3 000 e-mails/mois chez Resend, est-ce suffisant ?**
Largement : à deux utilisatrices se connectant occasionnellement par lien
magique, l'usage réel se compte en dizaines d'e-mails par mois, pas en
milliers. Si le besoin grandit un jour, Resend propose des paliers payants
sans rien reconfigurer côté Supabase.

**J'ai reçu un e-mail "recovery" qui pointe vers `localhost:3000` — c'est
normal ?**
Ce type de lien vient d'une action directe dans le tableau de bord Supabase
(ex. "Send password recovery" sur un utilisateur), pas de l'application
elle-même — l'app ne propose pas de réinitialisation de mot de passe en
libre-service, seulement connexion par mot de passe ou lien magique. Tant
que Site URL n'est pas réglé sur l'adresse Vercel (phase D), tout lien
généré depuis le tableau de bord pointera vers `localhost:3000` par défaut,
ce qui est normal en cours de configuration. Pour créer les 2 comptes,
préférez "Add user → Create new user" avec un mot de passe défini
directement et "Auto Confirm User" coché — ça n'envoie aucun e-mail.

**Clé API simple ou OAuth (phase F) — lequel choisir ?**
La clé API simple (Réglages → Clés MCP) suffit pour la plupart des clients
MCP et est plus rapide à mettre en place. OAuth (phase F) n'est nécessaire
que pour les clients qui l'exigent explicitement sans offrir d'alternative
— claude.ai en fait partie. Les deux aboutissent au même résultat technique
: un jeton stocké dans `api_keys`, révocable depuis la même page Réglages.

---

Une fois les phases A à E (et F si besoin) terminées, le cabinet a une base
de données, deux comptes, un service d'e-mail fiable, et une adresse en
ligne.
