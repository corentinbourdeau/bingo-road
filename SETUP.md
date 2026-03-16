# Route Bingo — Guide de configuration

## 1. Prérequis

- **Node.js 18+** et npm (ou yarn)
- **Compte Supabase** (gratuit sur [supabase.com](https://supabase.com))
- **Compte Vercel** (gratuit sur [vercel.com](https://vercel.com))

---

## 2. Supabase — Configuration complète

### Étape 1 : Créer un projet

1. Allez sur [supabase.com](https://supabase.com) et connectez-vous.
2. Cliquez sur **"New project"**.
3. Choisissez un nom, un mot de passe de base de données et une région (Europe de l'Ouest recommandée).
4. Attendez la création du projet (~1 minute).

### Étape 2 : Créer les tables

1. Dans le menu gauche, cliquez sur **SQL Editor**.
2. Cliquez sur **"New query"**.
3. Copiez-collez le SQL suivant et cliquez **Run** :

```sql
-- Table parties
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table joueurs
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table plaques repérées
CREATE TABLE spotted_plates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  department_code TEXT NOT NULL,
  spotted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(game_id, department_code)
);

-- RLS (Row Level Security)
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE spotted_plates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_access_games" ON games FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_access_players" ON players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_access_spotted_plates" ON spotted_plates FOR ALL USING (true) WITH CHECK (true);
```

### Étape 3 : Récupérer les clés API

1. Dans le menu gauche, allez dans **Settings > API**.
2. Copiez :
   - **Project URL** (ex: `https://xxxxxxxxxxxxxxxxxxxx.supabase.co`)
   - **anon public key** (commence par `eyJ...`)

---

## 3. Installation locale

```bash
# Cloner le repo
git clone <votre-repo>
cd bingo-road

# Installer les dépendances
npm install

# Créer le fichier d'environnement
cp .env.example .env
```

Éditez `.env` et renseignez vos valeurs Supabase :

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Lancez le serveur de développement :

```bash
npm run dev
```

L'application est accessible sur [http://localhost:5173](http://localhost:5173).

---

## 4. Déploiement Vercel

### Étape 1 : Pousser le code sur GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/votre-user/bingo-road.git
git push -u origin main
```

### Étape 2 : Importer sur Vercel

1. Allez sur [vercel.com](https://vercel.com) et connectez-vous.
2. Cliquez sur **"Add New… > Project"**.
3. Importez votre dépôt GitHub.
4. **Framework Preset** : sélectionnez **Vite**.
5. **Build Command** : `npm run build` (déjà configuré automatiquement).
6. **Output Directory** : `dist`.

### Étape 3 : Ajouter les variables d'environnement

Dans le panneau Vercel de votre projet :

1. Allez dans **Settings > Environment Variables**.
2. Ajoutez :
   - `VITE_SUPABASE_URL` → votre URL Supabase
   - `VITE_SUPABASE_ANON_KEY` → votre clé anon Supabase
3. Cliquez **Save** puis **Redeploy**.

### Étape 4 : Configurer les origines autorisées Supabase

1. Dans Supabase, allez dans **Authentication > URL Configuration**.
2. Dans **"Allowed redirect URLs"** et **"Site URL"**, ajoutez votre domaine Vercel (ex: `https://bingo-road.vercel.app`).
3. Cliquez **Save**.

---

## 5. Activer le Realtime dans Supabase

Pour que les mises à jour s'affichent en temps réel pour tous les joueurs :

1. Dans Supabase, allez dans **Database > Replication** (ou **Realtime**).
2. Activez la réplication pour les tables :
   - `spotted_plates`
   - `players`
   - `games` (optionnel, pour le changement de statut)
3. Cliquez **Save**.

> Sans cette étape, l'application fonctionne mais les joueurs doivent recharger la page pour voir les nouvelles plaques.

---

## 6. Tips PWA (optionnel)

L'application est déjà optimisée pour mobile grâce aux balises meta dans `index.html` :

- `viewport` avec `maximum-scale=1.0` pour éviter le zoom involontaire
- `theme-color` pour la barre de statut mobile
- `apple-mobile-web-app-capable` pour l'ajout à l'écran d'accueil iOS

Pour une expérience PWA complète (icône, splash screen, mode hors-ligne), vous pouvez ajouter [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) :

```bash
npm install -D vite-plugin-pwa
```

---

## 7. Structure des données

| Table | Description |
|-------|-------------|
| `games` | Une partie : nom, code 6 caractères, statut |
| `players` | Joueurs associés à une partie (prénom uniquement) |
| `spotted_plates` | Plaques repérées : une par département par partie |

La contrainte `UNIQUE(game_id, department_code)` garantit qu'une même plaque ne peut être cochée qu'une seule fois par partie — le premier joueur à la repérer remporte le point.
