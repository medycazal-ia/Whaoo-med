import { EDITEUR, HEBERGEUR, NOM_APPLICATION } from "@/lib/legal-info";

export default function MentionsLegalesPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 sm:px-6 py-12 text-ardoise">
      <h1 className="font-heading text-2xl font-semibold">Mentions légales</h1>

      <section className="mt-6">
        <h2 className="font-heading text-lg font-semibold">Éditeur du site</h2>
        <p className="mt-2 text-sm leading-relaxed text-ardoise/80">
          {EDITEUR.nom}, {EDITEUR.formeJuridique}
          <br />
          Siège social : {EDITEUR.adresse}
          <br />
          SIRET : {EDITEUR.siret}
          <br />
          Capital social : {EDITEUR.capitalSocial}
          <br />
          RCS : {EDITEUR.rcs}
          <br />
          N° TVA intracommunautaire : {EDITEUR.tva}
          <br />
          Directeur de la publication : {EDITEUR.directeurPublication}
          <br />
          Contact : {EDITEUR.emailContact}
        </p>
      </section>

      <section className="mt-6">
        <h2 className="font-heading text-lg font-semibold">Hébergement</h2>
        <p className="mt-2 text-sm leading-relaxed text-ardoise/80">
          {HEBERGEUR.nom}, {HEBERGEUR.formeJuridique}
          <br />
          {HEBERGEUR.adresse}
          <br />
          {HEBERGEUR.rcs}
          <br />
          Téléphone : {HEBERGEUR.telephone}
          <br />
          Site : {HEBERGEUR.siteWeb}
        </p>
      </section>

      <section className="mt-6">
        <h2 className="font-heading text-lg font-semibold">Propriété intellectuelle</h2>
        <p className="mt-2 text-sm leading-relaxed text-ardoise/80">
          L&apos;ensemble des contenus présents sur {NOM_APPLICATION} (textes,
          graphismes, logo, icônes, code) est la propriété de {EDITEUR.nom},
          sauf mention contraire, et est protégé par le droit d&apos;auteur.
          Toute reproduction ou représentation, totale ou partielle, sans
          autorisation est interdite.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="font-heading text-lg font-semibold">Données personnelles</h2>
        <p className="mt-2 text-sm leading-relaxed text-ardoise/80">
          Le traitement des données personnelles est décrit dans la{" "}
          <a href="/confidentialite" className="underline">
            politique de confidentialité
          </a>
          .
        </p>
      </section>

      <section className="mt-6">
        <h2 className="font-heading text-lg font-semibold">Droit applicable</h2>
        <p className="mt-2 text-sm leading-relaxed text-ardoise/80">
          Les présentes mentions légales sont soumises au droit français. En
          cas de litige, les tribunaux français seront seuls compétents.
        </p>
      </section>
    </main>
  );
}
