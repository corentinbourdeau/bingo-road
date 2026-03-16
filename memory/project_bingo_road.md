---
name: bingo_road_project
description: Context about the Bingo Road car license plate game project
type: project
---

Jeu de voiture multijoueur pour repérer les plaques de département français.

**Why:** Joué en voiture en famille/amis, besoin d'une app mobile simple sans friction (pas de mot de passe).

**How to apply:** Prioriser l'UX mobile-first, sessions sans mot de passe (prénom + localStorage), Supabase Realtime pour la synchro entre joueurs.

Stack: React + Vite + MUI (frontend), Supabase (BDD + Realtime + Auth).
Dépôt: /Users/corentinbourdeau/My/bingo-road
Guide: guide.md à la racine du projet.

Key decisions:
- Pas de compte : juste un prénom par joueur
- Une partie a un nom + un code court (6 chars) pour rejoindre
- UNIQUE(game_id, department_code) → une plaque cochée une seule fois par partie
- 101 départements : 01-95 + 2A/2B + 971-976 + plaques bonus (CD, W, TT)
