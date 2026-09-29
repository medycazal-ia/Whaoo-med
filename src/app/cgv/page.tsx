import type { Metadata } from "next";
import type { ReactNode } from "react";
import { EDITEUR, MEDIATEUR, NOM_APPLICATION } from "@/lib/legal-info";

export const metadata: Metadata = {
  title: "Conditions générales de vente — whaoo",
  description: "Conditions générales de vente de la boutique Bons plans de whaoo.",
};

// Conditions générales de vente de la boutique « Bons plans » (/boutique) :
// ventes à distance à des particuliers et à des professionnels, produits
// numériques, physiques et abonnements payés par Stripe. Base à faire
// relire par un professionnel du droit ; les informations propres à
// l'éditeur viennent de src/lib/legal-info.ts.

function Section({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="font-heading text-lg font-semibold">{titre}</h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-ardoise/80">{children}</div>
    </section>
  );
}

export default function CgvPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 text-ardoise sm:px-6">
      <h1 className="font-heading text-2xl font-semibold">Conditions générales de vente</h1>
      <p className="mt-2 text-sm text-ardoise/75">Version du 29 septembre 2026.</p>

      <Section titre="1. Vendeur">
        <p>
          Les ventes réalisées sur la boutique « Bons plans » de{" "}
          {NOM_APPLICATION} (whaoo.site/boutique) sont conclues avec :{" "}
          <strong>{EDITEUR.nom}</strong>, {EDITEUR.formeJuridique}, {EDITEUR.adresse},
          SIRET {EDITEUR.siret}. Contact : {EDITEUR.emailContact}.
        </p>
        <p>TVA : {EDITEUR.tva}.</p>
      </Section>

      <Section titre="2. Champ d'application">
        <p>
          Les présentes conditions générales de vente (CGV) s&apos;appliquent
          à toute commande passée sur la boutique, par un consommateur ou par
          un professionnel. Elles sont accessibles à tout moment sur cette
          page et sont acceptées par le client lorsqu&apos;il valide sa
          commande. Les CGV applicables sont celles en vigueur à la date de la
          commande.
        </p>
        <p>
          <strong>Offres de partenaires :</strong> lorsqu&apos;une offre porte
          la mention « Partenaire » et renvoie vers le site d&apos;un tiers
          (bouton « Voir l&apos;offre »), la vente est conclue directement
          avec ce partenaire, selon ses propres conditions. {EDITEUR.nom}{" "}
          n&apos;est pas partie à ce contrat.
        </p>
      </Section>

      <Section titre="3. Produits et services">
        <p>
          La boutique propose des produits numériques, des produits physiques
          et des services, vendus à l&apos;unité ou par abonnement. Leurs
          caractéristiques essentielles sont présentées sur la boutique et
          sur la page de paiement avant la commande. Les photographies sont
          aussi fidèles que possible mais n&apos;ont pas de valeur
          contractuelle. Les offres sont valables dans la limite des stocks
          disponibles ; en cas d&apos;indisponibilité après commande, le
          client en est informé et remboursé sans délai.
        </p>
      </Section>

      <Section titre="4. Prix">
        <p>
          Les prix sont indiqués en euros, toutes taxes comprises (TVA non
          applicable, article 293 B du Code général des impôts). Les frais
          de livraison éventuels sont indiqués sur la boutique et sur la page
          de paiement avant la validation de la commande. Le prix facturé est
          celui affiché au moment de la commande. Pour un abonnement, le prix
          et la périodicité (par exemple « 19,00 € / mois ») sont indiqués
          avant la souscription.
        </p>
      </Section>

      <Section titre="5. Commande">
        <p>
          Le client choisit un produit, clique sur « Acheter » ou
          « S&apos;abonner », puis renseigne ses coordonnées et son moyen de
          paiement sur la page de paiement sécurisée de Stripe. Il peut
          vérifier le détail et le prix total de sa commande et corriger ses
          éventuelles erreurs avant de la valider. La validation du paiement
          vaut commande ferme et acceptation des présentes CGV. Un email de
          confirmation récapitulant la commande est envoyé au client.
        </p>
      </Section>

      <Section titre="6. Paiement">
        <p>
          Le paiement est exigible à la commande. Il est traité par Stripe
          (Stripe Payments Europe, Irlande) : carte bancaire, Apple Pay,
          Google Pay, Link et, selon l&apos;éligibilité du client, Klarna
          (paiement en une fois, différé ou fractionné, soumis aux
          conditions de Klarna). {EDITEUR.nom} n&apos;a jamais accès aux
          données de carte bancaire. En cas de refus du paiement, la commande
          n&apos;est pas enregistrée.
        </p>
      </Section>

      <Section titre="7. Abonnements">
        <p>
          Un abonnement est souscrit pour la périodicité indiquée (par
          exemple mensuelle), <strong>sans durée minimale
          d&apos;engagement</strong>. Il est payé d&apos;avance au début de
          chaque période et se renouvelle automatiquement à son échéance
          jusqu&apos;à résiliation.
        </p>
        <p>
          Le client peut <strong>résilier à tout moment, en ligne</strong>,
          depuis l&apos;espace de gestion de son abonnement (lien « Gérer ou
          résilier mon abonnement » de la boutique), ou par simple email à{" "}
          {EDITEUR.emailContact}. La résiliation prend effet à la fin de la
          période déjà payée ; aucune nouvelle échéance n&apos;est alors
          prélevée. Toute modification du prix d&apos;un abonnement est
          annoncée au client au moins 30 jours avant son application ; il
          peut résilier avant cette date.
        </p>
      </Section>

      <Section titre="8. Livraison et exécution">
        <p>
          <strong>Produits numériques et services :</strong> accès ou mise à
          disposition par email ou en ligne après le paiement, ou exécution
          dans le délai annoncé sur l&apos;offre (par exemple « site vitrine
          livré en 2 jours ouvrés » à compter de la réception des éléments
          fournis par le client).
        </p>
        <p>
          <strong>Produits physiques :</strong> livraison à l&apos;adresse
          indiquée par le client, dans les zones proposées sur la page de
          paiement, dans le délai indiqué sur l&apos;offre ou, à défaut, au
          plus tard 30 jours après la commande. Le transfert des risques a
          lieu à la remise du produit au client. En cas de retard, le client
          peut, après une mise en demeure restée sans effet, annuler sa
          commande et être remboursé (articles L216-1 et suivants du Code de
          la consommation). Tout colis endommagé doit être signalé au
          transporteur et à {EDITEUR.emailContact} dans les meilleurs
          délais.
        </p>
      </Section>

      <Section titre="9. Droit de rétractation (consommateurs)">
        <p>
          Le consommateur dispose d&apos;un délai de <strong>14 jours</strong>{" "}
          pour se rétracter, sans avoir à se justifier : à compter de la
          réception du produit pour un bien, à compter de la commande pour un
          service ou un contenu numérique (articles L221-18 et suivants du
          Code de la consommation). Pour l&apos;exercer, il envoie avant
          l&apos;expiration du délai une déclaration claire à{" "}
          {EDITEUR.emailContact}, par exemple avec le formulaire ci-dessous.
        </p>
        <p>
          {EDITEUR.nom} rembourse la totalité des sommes versées, frais de
          livraison standard compris, au plus tard 14 jours après avoir été
          informé de la rétractation, avec le même moyen de paiement. Pour un
          bien, le remboursement peut être différé jusqu&apos;à la
          récupération du produit ou la preuve de son renvoi ; le produit
          doit être renvoyé dans les 14 jours, les{" "}
          <strong>frais de retour restant à la charge du client</strong>.
        </p>
        <p>
          <strong>Exceptions (article L221-28) :</strong> le droit de
          rétractation ne peut pas être exercé pour un contenu numérique
          fourni en ligne dont l&apos;exécution a commencé avec
          l&apos;accord préalable exprès du consommateur, qui a renoncé à
          son droit de rétractation, ni pour un service pleinement exécuté
          avant la fin du délai avec son accord exprès. Si le consommateur
          demande que l&apos;exécution d&apos;un service commence avant la
          fin du délai puis se rétracte, il paie le montant correspondant au
          service déjà fourni (article L221-25).
        </p>
        <p>
          Le droit de rétractation ne s&apos;applique pas aux achats réalisés
          par un professionnel pour les besoins de son activité.
        </p>
      </Section>

      <Section titre="10. Garanties légales">
        <p>
          Le consommateur bénéficie de la <strong>garantie légale de
          conformité</strong> (articles L217-3 et suivants du Code de la
          consommation pour les biens, L224-25-12 et suivants pour les
          contenus et services numériques) : pendant 2 ans à compter de la
          délivrance du bien, il peut obtenir sa réparation ou son
          remplacement, ou à défaut une réduction du prix ou
          l&apos;annulation de la vente, sans avoir à prouver
          l&apos;existence du défaut pendant cette période. Il bénéficie
          aussi de la <strong>garantie des vices cachés</strong> (articles
          1641 et suivants du Code civil), pendant 2 ans à compter de la
          découverte du vice. Ces garanties s&apos;exercent gratuitement
          auprès de {EDITEUR.nom} : {EDITEUR.emailContact}.
        </p>
      </Section>

      <Section titre="11. Responsabilité">
        <p>
          {EDITEUR.nom} est responsable de la bonne exécution des commandes
          conclues avec lui. Il ne peut être tenu responsable d&apos;une
          inexécution due au client, au fait imprévisible et insurmontable
          d&apos;un tiers ou à un cas de force majeure. Pour les offres de
          partenaires, la responsabilité incombe au partenaire vendeur.
        </p>
      </Section>

      <Section titre="12. Données personnelles">
        <p>
          Les données nécessaires à la commande (nom, email, adresse et
          téléphone de livraison le cas échéant) sont traitées pour
          l&apos;exécution de la vente, la facturation et les obligations
          légales, conformément à la{" "}
          <a href="/confidentialite" className="underline">
            politique de confidentialité
          </a>
          .
        </p>
      </Section>

      <Section titre="13. Réclamations et médiation">
        <p>
          Toute réclamation est à adresser à {EDITEUR.emailContact}. En cas
          de litige non résolu, le consommateur peut recourir gratuitement au
          médiateur de la consommation : {MEDIATEUR.nom} ({MEDIATEUR.site}),
          après avoir tenté de le résoudre directement par une réclamation
          écrite.
        </p>
      </Section>

      <Section titre="14. Droit applicable">
        <p>
          Les présentes CGV sont soumises au droit français. À défaut de
          résolution amiable, les litiges relèvent des tribunaux compétents ;
          le consommateur peut saisir, à son choix, la juridiction du lieu où
          il demeurait au moment de la commande.
        </p>
      </Section>

      <Section titre="Annexe — Formulaire de rétractation">
        <p>
          À compléter et renvoyer uniquement si vous souhaitez vous
          rétracter, par email à {EDITEUR.emailContact} :
        </p>
        <div className="rounded-xl border border-ardoise/20 bg-white/60 p-4 text-ardoise">
          <p>
            À l&apos;attention de {EDITEUR.nom}, {EDITEUR.adresse},{" "}
            {EDITEUR.emailContact} :
          </p>
          <p className="mt-2">
            Je vous notifie par la présente ma rétractation du contrat portant
            sur la vente du bien / la prestation de service ci-dessous :
          </p>
          <ul className="mt-2 list-none space-y-1">
            <li>Commandé le / reçu le : …………</li>
            <li>Produit ou service : …………</li>
            <li>Nom du consommateur : …………</li>
            <li>Adresse du consommateur : …………</li>
            <li>Date et signature (en cas d&apos;envoi papier) : …………</li>
          </ul>
        </div>
      </Section>
    </main>
  );
}
