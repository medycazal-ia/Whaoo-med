-- Origine du prix d'un article : saisi à la main, repris de la moyenne
-- communautaire, ou de la table statique indicative. Permet d'afficher un
-- badge dans l'app plutôt que de laisser l'utilisateur deviner.
alter table items
  add column if not exists prix_source text
    check (prix_source in ('manuel', 'communaute', 'statique'));
