-- Email visible dans la table profiles (et donc dans le Table Editor de
-- Supabase), pour pouvoir contacter les inscrits sans passer par l'onglet
-- Authentication. La source de vérité reste auth.users : cette colonne en
-- est une copie tenue à jour automatiquement, jamais modifiable à la main
-- par un utilisateur via l'API.

alter table public.profiles
  add column if not exists email text;

-- Rattrapage des comptes déjà inscrits.
update public.profiles p
  set email = u.email
  from auth.users u
  where u.id = p.id
    and p.email is distinct from u.email;

-- Nouveaux inscrits (email/mot de passe comme Google) : même fonction que
-- 0001, avec l'email en plus.
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

  insert into public.profiles (id, nom, prenom, email, telephone, avatar_id, referral_code, referred_by)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nom', ''),
    coalesce(new.raw_user_meta_data ->> 'prenom', ''),
    new.email,
    new.raw_user_meta_data ->> 'telephone',
    new.raw_user_meta_data ->> 'avatar_id',
    public.generate_referral_code(),
    sponsor_id
  );
  return new;
end;
$$;

-- Si un utilisateur change d'email (confirmation Supabase Auth), la copie
-- dans profiles suit.
create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute procedure public.sync_profile_email();

-- La policy RLS "Un utilisateur modifie son propre profil" autorise un
-- utilisateur à mettre à jour sa ligne : sans ce garde-fou, il pourrait y
-- écrire n'importe quel email. On réimpose systématiquement celui de
-- auth.users à chaque modification de la ligne.
create or replace function public.force_profile_email()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  select email into new.email from auth.users where id = new.id;
  return new;
end;
$$;

drop trigger if exists force_profile_email_on_update on public.profiles;
create trigger force_profile_email_on_update
  before update on public.profiles
  for each row execute procedure public.force_profile_email();
