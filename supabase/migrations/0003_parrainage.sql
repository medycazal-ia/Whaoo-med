-- Écran de parrainage (section 2.4 du cahier des charges) : expose
-- uniquement les colonnes nécessaires au suivi des filleuls (pas nom,
-- téléphone ni connecteur de données) via une fonction dédiée plutôt que
-- d'élargir la politique RLS de `profiles`.

create or replace function public.mes_filleuls()
returns table (id uuid, prenom text, cree_le timestamptz, actif boolean)
language sql
security definer
set search_path = public
stable
as $$
  select
    p.id,
    p.prenom,
    p.created_at as cree_le,
    exists(select 1 from public.budget_periods bp where bp.user_id = p.id) as actif
  from public.profiles p
  where p.referred_by = auth.uid();
$$;

grant execute on function public.mes_filleuls() to authenticated;
