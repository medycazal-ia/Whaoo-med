-- "Budget immédiat" : en plus du budget mensuel (table budget_periods,
-- inchangée), chaque achat peut être rattaché à une session de courses
-- ponctuelle (ex. "Courses du 20/09" ou "Courses du 20/09 à 14h32" s'il y
-- en a plusieurs le même jour). Permet de retrouver rapidement, sur la
-- facture du mois, quel passage en caisse (ou scan de ticket) correspond
-- à quels articles.
alter table items
  add column if not exists session_courses text;

create index if not exists items_session_courses_idx on public.items (user_id, session_courses);

-- La colonne liste_nom (listes nommées de recettes/régimes importés) est
-- déjà utilisée par le code depuis un moment mais n'avait jamais été
-- versionnée dans une migration — on la rajoute ici en toute sécurité
-- (idempotent) pour que les nouveaux environnements restent cohérents.
alter table items
  add column if not exists liste_nom text;
