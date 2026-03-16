# Route Bingo — Changements de configuration

## Supabase

**Realtime désactivé** — plus besoin de l'activer dans Database > Replication. La synchro se fait via le bouton Actualiser dans l'app. Aucun coût lié au Realtime.

**Authentication ignorée** — ne pas configurer Authentication > URL Configuration, l'app n'utilise pas Supabase Auth.

**DELETE déjà autorisé** — la policy `FOR ALL USING (true)` créée lors du setup couvre aussi le DELETE. La désélection de plaque fonctionne sans aucune modification.

## Vercel

Aucun changement — pas de nouvelle variable d'environnement, pas de modification de build.
