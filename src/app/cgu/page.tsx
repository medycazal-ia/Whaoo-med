import { EDITEUR, NOM_APPLICATION } from "@/lib/legal-info";

export default function CguPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 text-ardoise">
      <h1 className="font-heading text-2xl font-semibold">
        Conditions générales d&apos;utilisation
      </h1>
      <p className="mt-2 text-sm text-ardoise/60">Dernière mise à jour : à compléter à la mise en ligne.</p>

      <section className="mt-6">
        <h2 className="font-heading text-lg font-semibold">1. Objet</h2>
        <p className="mt-2 text-sm leading-relaxed text-ardoise/80">
          Les présentes conditions générales d&apos;utilisation (CGU)
          régissent l&apos;accès et l&apos;utilisation de {NOM_APPLICATION},
          édité par {EDITEUR.nom}, une application qui permet de noter ses
          courses, suivre un budget mensuel et calculer une cagnotte
          d&apos;épargne virtuelle.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="font-heading text-lg font-semibold">2. Acceptation</h2>
        <p className="mt-2 text-sm leading-relaxed text-ardoise/80">
          La création d&apos;un compte implique l&apos;acceptation pleine et
          entière des présentes CGU. Si tu ne les acceptes pas, tu ne dois
          pas utiliser le service.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="font-heading text-lg font-semibold">3. Compte utilisateur</h2>
        <p className="mt-2 text-sm leading-relaxed text-ardoise/80">
          La création d&apos;un compte nécessite un email valide et un mot
          de passe. Tu es responsable de la confidentialité de tes
          identifiants et de toute activité effectuée depuis ton compte. Un
          mode démo, sans inscription, est proposé pour découvrir
          l&apos;application ; les données saisies dans ce mode ne sont
          jamais conservées.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="font-heading text-lg font-semibold">4. Description du service</h2>
        <p className="mt-2 text-sm leading-relaxed text-ardoise/80">
          {NOM_APPLICATION} propose : la saisie de courses (manuelle ou
          vocale), le suivi d&apos;un budget mensuel, le calcul
          d&apos;une <strong>cagnotte interne</strong> (une estimation
          d&apos;épargne selon ton rythme de dépense, propre à ton compte),
          l&apos;export de tes données et de tes factures, et un programme
          de parrainage.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ardoise/80">
          Un lien vers une <strong>cagnotte de soutien</strong> externe
          (plateforme tierce) peut être proposé sur la page
          d&apos;accueil : il s&apos;agit d&apos;un don libre et facultatif
          au développement de l&apos;application, entièrement distinct de
          la cagnotte interne décrite ci-dessus, et sans contrepartie sur
          les fonctionnalités du service.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="font-heading text-lg font-semibold">5. Obligations de l&apos;utilisateur</h2>
        <p className="mt-2 text-sm leading-relaxed text-ardoise/80">
          Tu t&apos;engages à fournir des informations exactes, à ne pas
          utiliser le service à des fins illicites, et à ne pas tenter de
          perturber son fonctionnement ou d&apos;accéder aux données
          d&apos;autres utilisateurs.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="font-heading text-lg font-semibold">6. Parrainage</h2>
        <p className="mt-2 text-sm leading-relaxed text-ardoise/80">
          Chaque utilisateur dispose d&apos;un lien de parrainage personnel.
          Les conditions et éventuelles récompenses associées au programme
          de parrainage peuvent être précisées séparément et sont
          susceptibles d&apos;évoluer.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="font-heading text-lg font-semibold">7. Disponibilité et responsabilité</h2>
        <p className="mt-2 text-sm leading-relaxed text-ardoise/80">
          Nous nous efforçons d&apos;assurer un accès continu au service,
          sans garantie de disponibilité permanente. {EDITEUR.nom} ne
          saurait être tenue responsable des interruptions temporaires, des
          pertes de données résultant d&apos;un cas de force majeure, ou
          d&apos;une mauvaise utilisation du service par
          l&apos;utilisateur.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="font-heading text-lg font-semibold">8. Suppression de compte</h2>
        <p className="mt-2 text-sm leading-relaxed text-ardoise/80">
          Tu peux supprimer ton compte à tout moment depuis les paramètres
          de l&apos;application. Cette action est immédiate, définitive et
          entraîne la suppression de toutes tes données associées (voir la{" "}
          <a href="/confidentialite" className="underline">
            politique de confidentialité
          </a>
          ).
        </p>
      </section>

      <section className="mt-6">
        <h2 className="font-heading text-lg font-semibold">9. Modification des CGU</h2>
        <p className="mt-2 text-sm leading-relaxed text-ardoise/80">
          Les présentes CGU peuvent être modifiées à tout moment. La
          poursuite de l&apos;utilisation du service après une modification
          vaut acceptation des nouvelles conditions.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="font-heading text-lg font-semibold">10. Droit applicable</h2>
        <p className="mt-2 text-sm leading-relaxed text-ardoise/80">
          Les présentes CGU sont soumises au droit français. Tout litige
          relève de la compétence des tribunaux français.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="font-heading text-lg font-semibold">11. Contact</h2>
        <p className="mt-2 text-sm leading-relaxed text-ardoise/80">
          Pour toute question relative aux présentes CGU :{" "}
          {EDITEUR.emailContact}.
        </p>
      </section>
    </main>
  );
}
