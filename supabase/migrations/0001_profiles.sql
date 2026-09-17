-- Profils utilisateurs (whaoo)
-- Ne contient jamais de secrets (mot de passe, tokens OAuth des connecteurs) :
-- ceux-ci restent gérés par Supabase Auth / Vault, jamais dans cette table.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nom text not null,
  prenom text not null,
  telephone text,
  avatar_id text,
  referral_code text not null unique,
  referred_by uuid references public.profiles (id) on delete set null,
  data_connector text not null default 'interne'
    check (data_connector in ('interne', 'airtable', 'google_sheets', 'excel_onedrive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Un utilisateur voit son propre profil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Un utilisateur modifie son propre profil"
  on public.profiles for update
  using (auth.uid() = id);

-- Génère un code de parrainage court et lisible, avec vérification d'unicité.
create or replace function public.generate_referral_code()
returns text
language plpgsql
as $$
declare
  candidate text;
  exists_already boolean;
begin
  loop
    candidate := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
    select exists(select 1 from public.profiles where referral_code = candidate)
      into exists_already;
    exit when not exists_already;
  end loop;
  return candidate;
end;
$$;

-- Crée automatiquement un profil à l'inscription (section 2.1 du cahier des charges).
-- Les métadonnées (nom, prénom, téléphone, avatar, code de parrainage saisi)
-- sont transmises via `options.data` lors de l'appel `supabase.auth.signUp`.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  sponsor_id uuid;
begin
  if new.raw_user_meta_data ->> 'referral_code_used' is not null then
    select id into sponsor_id
      from public.profiles
      where referral_code = upper(new.raw_user_meta_data ->> 'referral_code_used');
  end if;

  insert into public.profiles (id, nom, prenom, telephone, avatar_id, referral_code, referred_by)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nom', ''),
    coalesce(new.raw_user_meta_data ->> 'prenom', ''),
    new.raw_user_meta_data ->> 'telephone',
    new.raw_user_meta_data ->> 'avatar_id',
    public.generate_referral_code(),
    sponsor_id
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
