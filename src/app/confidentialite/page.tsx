import { EDITEUR, NOM_APPLICATION } from "@/lib/legal-info";

export default function ConfidentialitePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 sm:px-6 py-12 text-ardoise">
      <h1 className="font-heading text-2xl font-semibold">
        Politique de confidentialité
      </h1>
      <p className="mt-2 text-sm text-ardoise/60">Dernière mise à jour : à compléter à la mise en ligne.</p>

      <section className="mt-6">
        <h2 className="font-heading text-lg font-semibold">Responsable du traitement</h2>
        <p className="mt-2 text-sm leading-relaxed text-ardoise/80">
          {EDITEUR.nom}, {EDITEUR.adresse}, est responsable du traitement des
          données personnelles collectées sur {NOM_APPLICATION}. Pour toute
          question ou exercice de tes droits : {EDITEUR.emailContact}.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="font-heading text-lg font-semibold">Données que nous collectons</h2>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ardoise/80">
          <li>
            <strong>Compte</strong> : nom, prénom, email, mot de passe
            (haché — jamais stocké en clair), téléphone (optionnel), avatar
            choisi, code de parrainage.
          </li>
          <li>
            <strong>Courses et budget</strong> : budget mensuel, articles
            (nom, détail, prix, quantité, statut). Stockées par défaut sur
            notre base interne ; si tu choisis un connecteur externe
            (Airtable, Google Sheets, Excel/OneDrive), ces mêmes données de
            courses y sont copiées — jamais tes identifiants de compte.
          </li>
          <li>
            <strong>Notifications</strong> : identifiant d&apos;abonnement
            push de ton navigateur, uniquement si tu actives les rappels.
          </li>
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="font-heading text-lg font-semibold">Pourquoi nous les utilisons</h2>
        <p className="mt-2 text-sm leading-relaxed text-ardoise/80">
          Ces données servent exclusivement au fonctionnement du service :
          créer et sécuriser ton compte, faire fonctionner le suivi de
          budget et de courses, t&apos;envoyer des rappels si tu les actives,
          et faire fonctionner le programme de parrainage. Base légale :
          exécution du contrat qui nous lie (les conditions générales
          d&apos;utilisation) et, pour le téléphone, l&apos;avatar et les
          notifications, ton consentement explicite.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="font-heading text-lg font-semibold">Combien de temps nous les gardons</h2>
        <p className="mt-2 text-sm leading-relaxed text-ardoise/80">
          Tant que ton compte existe. Si tu supprimes ton compte, toutes tes
          données (profil, budgets, articles, abonnements de notification)
          sont supprimées définitivement, sans délai artificiel.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="font-heading text-lg font-semibold">Qui y a accès</h2>
        <p className="mt-2 text-sm leading-relaxed text-ardoise/80">
          Toi seul(e) as accès à tes données de courses et de budget
          (contrôle technique appliqué à chaque requête, pas seulement une
          règle d&apos;affichage). Notre hébergeur de base de données,
          Supabase (Union européenne), héberge techniquement ces données.
          Si tu parraines quelqu&apos;un, seul son statut (inscrit ou actif)
          t&apos;est visible — jamais son nom, son email ou son téléphone.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="font-heading text-lg font-semibold">Tes droits</h2>
        <p className="mt-2 text-sm leading-relaxed text-ardoise/80">
          Conformément au RGPD, tu disposes d&apos;un droit d&apos;accès, de
          rectification, d&apos;effacement, de portabilité et
          d&apos;opposition sur tes données :
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-ardoise/80">
          <li>
            <strong>Accès et portabilité</strong> : télécharge une copie
            complète de tes données depuis Paramètres → Exporter mes
            données.
          </li>
          <li>
            <strong>Effacement</strong> : supprime ton compte et toutes tes
            données depuis Paramètres → Supprimer mon compte (action
            immédiate et irréversible).
          </li>
          <li>
            <strong>Rectification et opposition</strong> : contacte-nous à{" "}
            {EDITEUR.emailContact}.
          </li>
        </ul>
        <p className="mt-2 text-sm leading-relaxed text-ardoise/80">
          Tu peux aussi introduire une réclamation auprès de la CNIL
          (cnil.fr) si tu estimes que tes droits ne sont pas respectés.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="font-heading text-lg font-semibold">Cookies et traceurs</h2>
        <p className="mt-2 text-sm leading-relaxed text-ardoise/80">
          {NOM_APPLICATION} utilise uniquement des cookies strictement
          nécessaires au fonctionnement du service (maintien de ta session
          connectée). Aucun cookie publicitaire ou de mesure d&apos;audience
          tiers n&apos;est utilisé à ce jour.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="font-heading text-lg font-semibold">Sécurité</h2>
        <p className="mt-2 text-sm leading-relaxed text-ardoise/80">
          Les mots de passe sont hachés (jamais stockés en clair), les
          échanges sont chiffrés (HTTPS), et l&apos;accès à tes données est
          restreint techniquement à ton propre compte.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="font-heading text-lg font-semibold">Modifications</h2>
        <p className="mt-2 text-sm leading-relaxed text-ardoise/80">
          Cette politique peut évoluer ; la date de mise à jour en haut de
          page est actualisée à chaque changement significatif.
        </p>
      </section>
    </main>
  );
}
