-- Contributions communautaires de prix (inspiré de l'app Kiprix, née des
-- mobilisations contre la vie chère en Martinique) : les utilisateurs qui
-- connaissent le prix réel d'un article peuvent le partager anonymement
-- pour affiner les estimations de tout le monde (section "prix estimés").
-- Pas de scraping de sites tiers, pas de photo/OCR pour ce premier jet —
-- uniquement des contributions volontaires et explicites.

create table if not exists public.prix_communautaires (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label_normalise text not null,
  enseigne text,
  price numeric(10, 2) not null check (price > 0),
  created_at timestamptz not null default now()
);

create index if not exists prix_communautaires_label_idx on public.prix_communautaires (label_normalise);

alter table public.prix_communautaires enable row level security;

drop policy if exists "Un utilisateur ajoute ses propres contributions de prix" on public.prix_communautaires;
create policy "Un utilisateur ajoute ses propres contributions de prix"
  on public.prix_communautaires for insert
  with check (auth.uid() = user_id);

-- Pas de policy SELECT directe sur la table : on ne veut jamais exposer
-- qui a soumis quel prix, seulement des statistiques agrégées.
create or replace function public.prix_communautaires_stats()
returns table (label_normalise text, prix_moyen numeric, nb_contributions bigint)
language sql
security definer
set search_path = public
stable
as $$
  select
    label_normalise,
    round(avg(price)::numeric, 2) as prix_moyen,
    count(*) as nb_contributions
  from public.prix_communautaires
  group by label_normalise;
$$;

grant execute on function public.prix_communautaires_stats() to authenticated;
