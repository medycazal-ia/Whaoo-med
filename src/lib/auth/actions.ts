"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function safeRedirectTarget(raw: FormDataEntryValue | null): string {
  const value = typeof raw === "string" ? raw : "";
  return value.startsWith("/") ? value : "/app";
}

export async function signInWithPassword(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const redirectTo = safeRedirectTarget(formData.get("redirectTo"));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/connexion?error=credentials&redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  redirect(redirectTo);
}

export async function signUpWithPassword(formData: FormData): Promise<void> {
  const nom = String(formData.get("nom") ?? "").trim();
  const prenom = String(formData.get("prenom") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const telephone = String(formData.get("telephone") ?? "").trim();
  const avatarId = String(formData.get("avatarId") ?? "").trim();
  const referralCodeUsed = String(formData.get("referralCode") ?? "").trim();
  const cguAccepted = formData.get("cguAccepted") === "on";
  const rgpdConsent = formData.get("rgpdConsent") === "on";

  if (!nom || !prenom || !email || !password) {
    redirect("/inscription?error=missing_fields");
  }

  // Consentement RGPD distinct de l'acceptation des CGU (section 5.1 du cahier des charges).
  if (!cguAccepted || !rgpdConsent) {
    redirect("/inscription?error=consent_required");
  }

  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${appUrl}/auth/callback`,
      data: {
        nom,
        prenom,
        telephone: telephone || null,
        avatar_id: avatarId || null,
        referral_code_used: referralCodeUsed ? referralCodeUsed.toUpperCase() : null,
      },
    },
  });

  if (error) {
    const code = error.message.toLowerCase().includes("already registered")
      ? "already_registered"
      : "signup_failed";
    redirect(`/inscription?error=${code}`);
  }

  redirect("/inscription/verifie-ton-email");
}

export async function signInWithGoogle(): Promise<void> {
  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${appUrl}/auth/callback`,
    },
  });

  if (error || !data.url) {
    redirect("/connexion?error=google");
  }

  redirect(data.url);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/connexion");
}

export async function requestPasswordReset(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/reinitialiser-mot-de-passe`,
  });

  // Toujours la même redirection, qu'un compte existe ou non pour cet email.
  redirect("/mot-de-passe-oublie/envoye");
}

export async function updatePassword(formData: FormData): Promise<void> {
  const password = String(formData.get("password") ?? "");

  if (password.length < 8) {
    redirect("/reinitialiser-mot-de-passe?error=too_short");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect("/reinitialiser-mot-de-passe?error=update_failed");
  }

  redirect("/app");
}
