-- Période de budget personnalisable + date d'achat réelle.
--
-- 1. profiles.jour_debut_periode : jour du mois où commence la période de
--    budget de l'utilisateur (1 = mois calendaire, 25 = du 25 au 24 du
--    mois suivant, ex. jour de paie). Limité à 28 pour exister dans tous
--    les mois, février compris.
-- 2. items.achete_le : moment réel de l'achat. achat_mois devient le
--    premier jour de la PÉRIODE d'achat (et non plus forcément le 1er du
--    mois) ; budget_periods.month suit la même convention. Avec
--    jour_debut_periode = 1, rien ne change pour les données existantes.
--
-- Migration uniquement additive : sans danger à appliquer avant le
-- déploiement du code qui l'utilise.

alter table public.profiles
  add column if not exists jour_debut_periode smallint not null default 1
    check (jour_debut_periode between 1 and 28);

alter table public.items
  add column if not exists achete_le timestamptz;

-- Rattrapage des achats existants : date réelle inconnue, on prend la
-- dernière modification, en la ramenant dans le mois d'achat enregistré
-- si elle en sort (article modifié plus tard).
update public.items
  set achete_le = case
    when achat_mois is not null
      and (updated_at < achat_mois::timestamptz
           or updated_at >= (achat_mois + interval '1 month')::timestamptz)
      then (achat_mois::timestamptz + interval '12 hours')
    else updated_at
  end
  where status = 'achete'
    and achete_le is null;

create index if not exists items_achete_le_idx on public.items (user_id, achete_le);
