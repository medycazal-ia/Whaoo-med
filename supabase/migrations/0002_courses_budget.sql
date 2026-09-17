-- Fonctionnalités métier de base (section 3 du cahier des charges) :
-- budget mensuel + liste de courses, stockage interne par défaut.

create extension if not exists pgcrypto;

create table if not exists public.budget_periods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  month date not null, -- toujours le premier jour du mois, ex. 2026-09-01
  budget_amount numeric(10, 2) not null check (budget_amount >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, month)
);

-- Les articles ne sont PAS rattachés à un mois : la liste "à acheter plus
-- tard" est un pense-bête permanent (fidèle au prototype validé), qui
-- traverse les mois sans être perdu. Seul un achat effectif ("achete")
-- est daté (`achat_mois`) pour être compté dans le budget du bon mois.
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null,
  detail text, -- ex. "1 kg", "sachet de 3" (repris du prototype)
  price numeric(10, 2) not null default 0 check (price >= 0),
  quantity integer not null default 1 check (quantity >= 1),
  status text not null default 'a_acheter' check (status in ('a_acheter', 'achete')),
  achat_mois date, -- premier jour du mois d'achat, uniquement si status = 'achete'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists items_user_status_idx on public.items (user_id, status);
create index if not exists items_achat_mois_idx on public.items (user_id, achat_mois);

alter table public.budget_periods enable row level security;
alter table public.items enable row level security;

create policy "Un utilisateur gère ses propres périodes de budget"
  on public.budget_periods for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Un utilisateur gère ses propres articles"
  on public.items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
