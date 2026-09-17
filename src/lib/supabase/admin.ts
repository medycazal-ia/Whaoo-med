import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client "service role" — contourne les RLS, à n'utiliser que côté serveur
 * pour des opérations qu'un utilisateur ne peut pas faire sur lui-même via
 * l'API publique (ex. suppression définitive du compte auth.users, qui
 * entraîne en cascade celle de profiles/budget_periods/items).
 * Ne jamais importer ce module depuis un composant client.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
