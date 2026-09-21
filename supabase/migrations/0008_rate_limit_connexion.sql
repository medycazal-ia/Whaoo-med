-- Limitation du débit sur la connexion (section 5 du cahier des charges,
-- durcissement sécurité) : empêche une attaque par force brute sur le mot
-- de passe d'un compte en comptant les tentatives échouées récentes par
-- email. Table accédée uniquement via le client "service role" côté
-- serveur (jamais par un utilisateur authentifié ou anonyme) : RLS activée
-- sans aucune policy, ce qui bloque tout accès en dehors du service role.

create table if not exists public.tentatives_connexion (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  cree_le timestamptz not null default now()
);

create index if not exists tentatives_connexion_email_idx
  on public.tentatives_connexion (email, cree_le);

alter table public.tentatives_connexion enable row level security;
