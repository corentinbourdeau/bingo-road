# Route Bingo — Guide de développement

Jeu de voiture multijoueur : repérer les plaques de département français en temps réel.

---

## Stack technique

| Couche | Techno |
|--------|--------|
| Frontend | React (Vite) + Material UI (MUI) |
| Backend / BDD | Supabase (Auth, Postgres, Realtime) |
| Déploiement | Vercel (frontend) |

---

## Concept du jeu

1. Un joueur crée une **partie** (avec un nom) et obtient un **code** à partager.
2. Les autres joueurs rejoignent via ce code en entrant simplement leur **prénom**.
3. Tous voient la même **check-list** des départements.
4. Quand un joueur repère une plaque, il la coche — tout le monde voit la mise à jour en temps réel.
5. À la fin, les **stats** indiquent qui a trouvé quoi.

---

## Base de données Supabase

### Table `games`

```sql
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,         -- code court ex: "ABC123"
  status TEXT DEFAULT 'active',      -- active | finished
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Table `players`

```sql
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                -- prénom uniquement
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Table `spotted_plates`

```sql
CREATE TABLE spotted_plates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  department_code TEXT NOT NULL,     -- ex: "75", "2A", "971"
  spotted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(game_id, department_code)   -- une plaque = une seule fois par partie
);
```

> **Note** : La contrainte `UNIQUE(game_id, department_code)` empêche de cocher la même plaque deux fois dans une même partie. Le premier joueur à la trouver l'emporte.

### Row Level Security (RLS)

Activer RLS sur toutes les tables. Politique simple : tout le monde peut lire et insérer (pas de suppression ni modification).

```sql
-- Exemple pour spotted_plates
ALTER TABLE spotted_plates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON spotted_plates FOR ALL USING (true) WITH CHECK (true);
```

---

## Liste des départements

Chaque département a : **numéro**, **nom**, **région**.

### Métropole (01 – 95)

| N° | Nom | Région |
|----|-----|--------|
| 01 | Ain | Auvergne-Rhône-Alpes |
| 02 | Aisne | Hauts-de-France |
| 03 | Allier | Auvergne-Rhône-Alpes |
| 04 | Alpes-de-Haute-Provence | Provence-Alpes-Côte d'Azur |
| 05 | Hautes-Alpes | Provence-Alpes-Côte d'Azur |
| 06 | Alpes-Maritimes | Provence-Alpes-Côte d'Azur |
| 07 | Ardèche | Auvergne-Rhône-Alpes |
| 08 | Ardennes | Grand Est |
| 09 | Ariège | Occitanie |
| 10 | Aube | Grand Est |
| 11 | Aude | Occitanie |
| 12 | Aveyron | Occitanie |
| 13 | Bouches-du-Rhône | Provence-Alpes-Côte d'Azur |
| 14 | Calvados | Normandie |
| 15 | Cantal | Auvergne-Rhône-Alpes |
| 16 | Charente | Nouvelle-Aquitaine |
| 17 | Charente-Maritime | Nouvelle-Aquitaine |
| 18 | Cher | Centre-Val de Loire |
| 19 | Corrèze | Nouvelle-Aquitaine |
| 2A | Corse-du-Sud | Corse |
| 2B | Haute-Corse | Corse |
| 21 | Côte-d'Or | Bourgogne-Franche-Comté |
| 22 | Côtes-d'Armor | Bretagne |
| 23 | Creuse | Nouvelle-Aquitaine |
| 24 | Dordogne | Nouvelle-Aquitaine |
| 25 | Doubs | Bourgogne-Franche-Comté |
| 26 | Drôme | Auvergne-Rhône-Alpes |
| 27 | Eure | Normandie |
| 28 | Eure-et-Loir | Centre-Val de Loire |
| 29 | Finistère | Bretagne |
| 30 | Gard | Occitanie |
| 31 | Haute-Garonne | Occitanie |
| 32 | Gers | Occitanie |
| 33 | Gironde | Nouvelle-Aquitaine |
| 34 | Hérault | Occitanie |
| 35 | Ille-et-Vilaine | Bretagne |
| 36 | Indre | Centre-Val de Loire |
| 37 | Indre-et-Loire | Centre-Val de Loire |
| 38 | Isère | Auvergne-Rhône-Alpes |
| 39 | Jura | Bourgogne-Franche-Comté |
| 40 | Landes | Nouvelle-Aquitaine |
| 41 | Loir-et-Cher | Centre-Val de Loire |
| 42 | Loire | Auvergne-Rhône-Alpes |
| 43 | Haute-Loire | Auvergne-Rhône-Alpes |
| 44 | Loire-Atlantique | Pays de la Loire |
| 45 | Loiret | Centre-Val de Loire |
| 46 | Lot | Occitanie |
| 47 | Lot-et-Garonne | Nouvelle-Aquitaine |
| 48 | Lozère | Occitanie |
| 49 | Maine-et-Loire | Pays de la Loire |
| 50 | Manche | Normandie |
| 51 | Marne | Grand Est |
| 52 | Haute-Marne | Grand Est |
| 53 | Mayenne | Pays de la Loire |
| 54 | Meurthe-et-Moselle | Grand Est |
| 55 | Meuse | Grand Est |
| 56 | Morbihan | Bretagne |
| 57 | Moselle | Grand Est |
| 58 | Nièvre | Bourgogne-Franche-Comté |
| 59 | Nord | Hauts-de-France |
| 60 | Oise | Hauts-de-France |
| 61 | Orne | Normandie |
| 62 | Pas-de-Calais | Hauts-de-France |
| 63 | Puy-de-Dôme | Auvergne-Rhône-Alpes |
| 64 | Pyrénées-Atlantiques | Nouvelle-Aquitaine |
| 65 | Hautes-Pyrénées | Occitanie |
| 66 | Pyrénées-Orientales | Occitanie |
| 67 | Bas-Rhin | Grand Est |
| 68 | Haut-Rhin | Grand Est |
| 69 | Rhône | Auvergne-Rhône-Alpes |
| 70 | Haute-Saône | Bourgogne-Franche-Comté |
| 71 | Saône-et-Loire | Bourgogne-Franche-Comté |
| 72 | Sarthe | Pays de la Loire |
| 73 | Savoie | Auvergne-Rhône-Alpes |
| 74 | Haute-Savoie | Auvergne-Rhône-Alpes |
| 75 | Paris | Île-de-France |
| 76 | Seine-Maritime | Normandie |
| 77 | Seine-et-Marne | Île-de-France |
| 78 | Yvelines | Île-de-France |
| 79 | Deux-Sèvres | Nouvelle-Aquitaine |
| 80 | Somme | Hauts-de-France |
| 81 | Tarn | Occitanie |
| 82 | Tarn-et-Garonne | Occitanie |
| 83 | Var | Provence-Alpes-Côte d'Azur |
| 84 | Vaucluse | Provence-Alpes-Côte d'Azur |
| 85 | Vendée | Pays de la Loire |
| 86 | Vienne | Nouvelle-Aquitaine |
| 87 | Haute-Vienne | Nouvelle-Aquitaine |
| 88 | Vosges | Grand Est |
| 89 | Yonne | Bourgogne-Franche-Comté |
| 90 | Territoire de Belfort | Bourgogne-Franche-Comté |
| 91 | Essonne | Île-de-France |
| 92 | Hauts-de-Seine | Île-de-France |
| 93 | Seine-Saint-Denis | Île-de-France |
| 94 | Val-de-Marne | Île-de-France |
| 95 | Val-d'Oise | Île-de-France |

### Outre-mer (DOM-TOM)

| N° | Nom | Région |
|----|-----|--------|
| 971 | Guadeloupe | Outre-mer |
| 972 | Martinique | Outre-mer |
| 973 | Guyane | Outre-mer |
| 974 | La Réunion | Outre-mer |
| 976 | Mayotte | Outre-mer |

### Plaques spéciales (bonus)

| Code | Description |
|------|-------------|
| CD | Corps Diplomatique |
| W | Plaques de transit / garage |
| TT | Transit temporaire |

---

## Architecture frontend (React + MUI)

### Structure des pages

```
/                    → Accueil : créer ou rejoindre une partie
/game/:code          → Partie en cours (check-list + carte + joueurs)
/game/:code/stats    → Statistiques de fin de partie
```

### Structure des composants

```
src/
├── pages/
│   ├── Home.jsx          # Créer / rejoindre
│   ├── Game.jsx          # Partie en cours
│   └── Stats.jsx         # Stats
├── components/
│   ├── CreateGame.jsx     # Formulaire création
│   ├── JoinGame.jsx       # Formulaire rejoindre
│   ├── PlayerSelect.jsx   # Sélection du prénom
│   ├── PlateList.jsx      # Check-list des plaques
│   ├── PlateItem.jsx      # Une plaque (cocher)
│   ├── FranceMap.jsx      # Carte SVG de France (départements colorés)
│   ├── PlayerChip.jsx     # Badge joueur en ligne
│   └── ScoreBoard.jsx     # Tableau des scores
├── lib/
│   ├── supabase.js        # Client Supabase
│   └── departments.js     # Liste statique des 101 départements + coordonnées SVG
└── hooks/
    ├── useGame.js         # Données + realtime de la partie
    └── usePlayer.js       # Joueur courant (localStorage)
```

### Gestion du joueur (sans mot de passe)

Le joueur courant est stocké en **localStorage** :

```js
// localStorage
{ playerId: "uuid", playerName: "Marie", gameCode: "ABC123" }
```

Au lancement, si une session existe pour ce code de partie → on reprend directement.

---

## Flux utilisateur

### Créer une partie

```
Accueil
  └─ "Créer une partie"
       └─ Saisir le nom de la partie (ex: "Vacances Bretagne")
            └─ Saisir son prénom
                 └─ → /game/ABC123 (check-list vide, 1 joueur)
```

### Rejoindre une partie

```
Accueil
  └─ "Rejoindre" + saisir le code
       └─ Sélectionner son prénom parmi les joueurs existants
          OU saisir un nouveau prénom
               └─ → /game/ABC123 (check-list en cours)
```

### Cocher une plaque

```
Joueur voit une plaque → tap sur le département
  └─ INSERT dans spotted_plates
       └─ Supabase Realtime broadcast → tous les joueurs voient la coche instantanément
```

---

## Realtime Supabase

Abonnement aux changements de `spotted_plates` pour une partie donnée :

```js
supabase
  .channel(`game-${gameId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'spotted_plates',
    filter: `game_id=eq.${gameId}`
  }, (payload) => {
    // Mettre à jour la liste localement
  })
  .subscribe()
```

---

## Carte interactive de France

### Composant `FranceMap.jsx`

La carte est un SVG des départements français. Chaque département est coloré selon son état :

| Couleur | Signification |
|---------|---------------|
| Gris clair | Non trouvée |
| Vert | Trouvée (avec le prénom du joueur en tooltip) |

**Source SVG recommandée** : utiliser la lib `react-simple-maps` (topojson France) ou un SVG statique des départements (disponible sur [geojson.io](https://geojson.io) ou Wikipedia Commons).

```jsx
// Exemple avec react-simple-maps
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'

const GEO_URL = '/france-departments.json' // topojson local

export default function FranceMap({ spottedCodes }) {
  return (
    <ComposableMap projection="geoMercator">
      <Geographies geography={GEO_URL}>
        {({ geographies }) =>
          geographies.map((geo) => {
            const code = geo.properties.code
            const isSpotted = spottedCodes.includes(code)
            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill={isSpotted ? '#4caf50' : '#e0e0e0'}
                stroke="#fff"
                strokeWidth={0.5}
              />
            )
          })
        }
      </Geographies>
    </ComposableMap>
  )
}
```

La carte se met à jour en temps réel via Supabase Realtime : à chaque nouveau `spotted_plate`, `spottedCodes` est mis à jour et le département passe au vert.

**Disposition dans la page Game** : onglet dédié "Carte" dans la bottom navigation (à côté de "Liste" et "Joueurs").

---

## Statistiques

À afficher en fin de partie (ou en temps réel dans un onglet) :

| Stat | Description |
|------|-------------|
| Score total | Nombre de plaques trouvées par joueur |
| Podium | Classement des joueurs |
| Carte colorée | Tous les départements trouvés en vert sur la carte France |
| Première trouvée | Quelle était la 1ère plaque cochée |
| Rare trophy | Plaque DOM-TOM ou CD trouvée |

---

## Étapes de développement recommandées

### Phase 1 — Fondations
- [ ] Init projet Vite + React + MUI
- [ ] Créer projet Supabase, créer les tables SQL
- [ ] Fichier `departments.js` avec les 101 départements
- [ ] Client Supabase configuré

### Phase 2 — Créer / rejoindre
- [ ] Page Accueil avec `CreateGame` et `JoinGame`
- [ ] Génération du code court (6 caractères aléatoires)
- [ ] Stockage du joueur en localStorage

### Phase 3 — Partie en cours
- [ ] Page Game avec `PlateList`
- [ ] Cocher une plaque → INSERT Supabase
- [ ] Abonnement Realtime → mise à jour instantanée
- [ ] Affichage des joueurs connectés
- [ ] Intégrer `react-simple-maps` + topojson France
- [ ] Composant `FranceMap` : départements verts en temps réel

### Phase 4 — Stats & polish
- [ ] Page Stats avec podium et scores
- [ ] Design mobile-first MUI (bottom navigation, cards full-width)
- [ ] Mode "terminé" pour geler la partie

---

## Tips MUI mobile-first

- `<BottomNavigation>` avec 3 onglets : **Liste** / **Carte** / **Joueurs**
- `<List>` dense avec `<ListItemButton>` pour les plaques (tap friendly)
- `<Chip>` pour afficher les joueurs en ligne
- `<Badge>` sur les plaques pour montrer qui l'a trouvée
- Thème avec `primaryColor` personnalisé (ex: bleu/rouge tricolore)
- La carte SVG prend toute la hauteur disponible sur mobile (`height: 100%`)
- Tooltip MUI sur chaque département vert : afficher le prénom du joueur qui l'a trouvée

---

## Variables d'environnement

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```
