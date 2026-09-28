import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

OUT = "/tmp/claude-0/-home-user-Whaoo-med/4802447b-d32d-5a62-82f0-f09ec055d7a6/scratchpad/registre-cnil/whaoo-registre-des-traitements.xlsx"

FONT_NAME = "Arial"

TITLE_FILL = PatternFill("solid", fgColor="1F2937")
HEADER_FILL = PatternFill("solid", fgColor="374151")
TOFILL_FILL = PatternFill("solid", fgColor="FFF9C4")  # jaune : a completer/verifier
BAND_FILL = PatternFill("solid", fgColor="F3F4F6")

WHITE_BOLD = Font(name=FONT_NAME, size=11, bold=True, color="FFFFFF")
TITLE_FONT = Font(name=FONT_NAME, size=16, bold=True, color="FFFFFF")
BODY = Font(name=FONT_NAME, size=10)
BODY_BOLD = Font(name=FONT_NAME, size=10, bold=True)
ITALIC_GRAY = Font(name=FONT_NAME, size=10, italic=True, color="6B7280")

THIN = Side(style="thin", color="D1D5DB")
BORDER = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)

WRAP_TOP = Alignment(wrap_text=True, vertical="top", horizontal="left")
WRAP_TOP_CENTER = Alignment(wrap_text=True, vertical="top", horizontal="center")

wb = openpyxl.Workbook()

# ------------------------------------------------------------------
# Feuille 1 : Lisez-moi
# ------------------------------------------------------------------
ws0 = wb.active
ws0.title = "Lisez-moi"
ws0.sheet_view.showGridLines = False
ws0.column_dimensions["A"].width = 100

ws0["A1"] = "Registre des activités de traitement — whaoo"
ws0["A1"].font = Font(name=FONT_NAME, size=18, bold=True, color="1F2937")
ws0.row_dimensions[1].height = 28

intro = (
    "Ce registre recense, pour l'application whaoo, chaque traitement de données "
    "personnelles : sa finalité, les données concernées, sa base légale, ses "
    "destinataires (y compris les sous-traitants) et sa durée de conservation. "
    "C'est une obligation prévue par l'article 30 du RGPD, y compris pour une "
    "petite structure."
)
ws0["A3"] = intro
ws0["A3"].font = BODY
ws0["A3"].alignment = WRAP_TOP
ws0.row_dimensions[3].height = 60
ws0.merge_cells("A3:A3")

ws0["A5"] = "Comment utiliser ce document"
ws0["A5"].font = BODY_BOLD

ws0["A6"] = (
    "1. Les traitements de l'onglet \"Registre\" sont pré-remplis à partir du "
    "fonctionnement réel actuel de l'application (code, base de données, politique "
    "de confidentialité). Relis chaque ligne pour confirmer qu'elle correspond bien "
    "à la réalité."
)
ws0["A6"].font = BODY
ws0["A6"].alignment = WRAP_TOP
ws0.row_dimensions[6].height = 45

ws0["A7"] = (
    "2. Les cellules surlignées en jaune sont à compléter ou à vérifier toi-même "
    "(ou avec un professionnel) — ce sont des informations que je ne peux pas "
    "connaître ou confirmer avec certitude depuis le code seul."
)
ws0["A7"].font = BODY
ws0["A7"].alignment = WRAP_TOP
ws0.row_dimensions[7].height = 45

ws0["A8"] = (
    "3. Si tu ajoutes une nouvelle fonctionnalité qui traite des données "
    "personnelles (ou un nouveau prestataire tiers), ajoute une ligne au registre "
    "au même moment — c'est le principal risque d'un registre : qu'il devienne "
    "obsolète."
)
ws0["A8"].font = BODY
ws0["A8"].alignment = WRAP_TOP
ws0.row_dimensions[8].height = 45

ws0["A10"] = "Légende"
ws0["A10"].font = BODY_BOLD

ws0["A11"] = "  À compléter / à vérifier par toi (ou un professionnel)"
ws0["A11"].fill = TOFILL_FILL
ws0["A11"].font = BODY

ws0["A13"] = "Responsable du traitement"
ws0["A13"].font = BODY_BOLD
ws0["A14"] = "La Maison du Crel (Medy Cazal), entreprise individuelle — 231 rue du Faubourg Saint-Honoré, 75001 Paris. SIRET 415 073 055 00139."
ws0["A14"].font = BODY
ws0["A14"].alignment = WRAP_TOP
ws0.row_dimensions[14].height = 30

ws0["A16"] = "Délégué à la protection des données (DPO)"
ws0["A16"].font = BODY_BOLD
ws0["A17"] = "Aucun DPO désigné — non obligatoire à cette échelle (pas de traitement à grande échelle de données sensibles). Une seule personne reste responsable en interne de ces sujets :"
ws0["A17"].fill = TOFILL_FILL
ws0["A17"].font = BODY
ws0["A17"].alignment = WRAP_TOP
ws0.row_dimensions[17].height = 45

ws0["A19"] = "Dernière mise à jour de ce registre"
ws0["A19"].font = BODY_BOLD
ws0["A20"] = "À compléter à chaque modification"
ws0["A20"].fill = TOFILL_FILL
ws0["A20"].font = BODY

# ------------------------------------------------------------------
# Feuille 2 : Registre
# ------------------------------------------------------------------
ws = wb.create_sheet("Registre des traitements")
ws.sheet_view.showGridLines = False

headers = [
    "Traitement",
    "Finalité",
    "Personnes concernées",
    "Catégories de données traitées",
    "Base légale",
    "Destinataires / sous-traitants",
    "Durée de conservation",
    "Mesures de sécurité",
    "Transfert hors UE",
]

widths = [22, 30, 20, 32, 22, 28, 26, 30, 26]
for i, w in enumerate(widths, start=1):
    ws.column_dimensions[get_column_letter(i)].width = w

ws.merge_cells("A1:I1")
ws["A1"] = "Registre des activités de traitement — whaoo"
ws["A1"].font = TITLE_FONT
ws["A1"].fill = TITLE_FILL
ws["A1"].alignment = Alignment(horizontal="left", vertical="center", indent=1)
ws.row_dimensions[1].height = 26

header_row = 2
for i, h in enumerate(headers, start=1):
    c = ws.cell(row=header_row, column=i, value=h)
    c.font = WHITE_BOLD
    c.fill = HEADER_FILL
    c.alignment = WRAP_TOP_CENTER
    c.border = BORDER
ws.row_dimensions[header_row].height = 32
ws.freeze_panes = "A3"

# (nom, finalite, personnes, donnees, base_legale, destinataires, duree, securite, transfert, to_fill_cols)
rows = [
    (
        "Gestion des comptes utilisateurs",
        "Créer, authentifier et sécuriser le compte de chaque utilisateur.",
        "Utilisateurs de whaoo",
        "Nom, prénom, email, mot de passe (haché), téléphone (optionnel), avatar choisi, code de parrainage.",
        "Exécution du contrat (CGU) ; consentement pour le téléphone et l'avatar.",
        "Supabase (hébergeur technique, base de données et authentification).",
        "Durée de vie du compte ; suppression définitive et immédiate en cas de demande de suppression.",
        "Mots de passe hachés (Supabase Auth, jamais en clair), HTTPS, contrôle d'accès en base (Row Level Security) limitant chaque utilisateur à ses propres données.",
        "Non, si le projet Supabase est hébergé en UE (région à confirmer dans le dashboard Supabase).",
        [8],  # colonne "Transfert hors UE" a verifier (index 0-based dans la donnee, colonne 9 reelle)
    ),
    (
        "Gestion des courses et du budget",
        "Permettre le suivi de la liste de courses et du budget mensuel.",
        "Utilisateurs de whaoo",
        "Articles (nom, détail, prix, quantité, statut), budget mensuel, sessions de courses.",
        "Exécution du contrat (CGU).",
        "Supabase. Si un connecteur externe est activé (Airtable / Google Sheets / Excel-OneDrive — fonctionnalité pas encore active à ce jour), les mêmes données de courses y sont copiées.",
        "Durée de vie du compte ; suppression définitive en cas de suppression de compte.",
        "Row Level Security, HTTPS.",
        "Non par défaut.",
        [],
    ),
    (
        "Programme de parrainage",
        "Suivre les filleuls et faire fonctionner les récompenses de parrainage.",
        "Utilisateurs parrains et filleuls",
        "Code de parrainage, statut du filleul (inscrit / actif) — jamais le nom, l'email ou le téléphone du filleul visible par le parrain.",
        "Exécution du contrat (CGU).",
        "Supabase uniquement.",
        "Durée de vie du compte.",
        "Fonction dédiée en base limitant volontairement les colonnes exposées au parrain (pas d'élargissement de la politique d'accès du profil).",
        "Non.",
        [],
    ),
    (
        "Notifications push (rappels)",
        "Envoyer un rappel quand des articles restent à acheter.",
        "Utilisateurs ayant activé les notifications",
        "Identifiant d'abonnement push du navigateur (endpoint et clés de chiffrement techniques).",
        "Consentement explicite (activation volontaire dans les réglages).",
        "Supabase ; le navigateur/système d'exploitation de l'utilisateur (protocole Push standard, hors de notre contrôle une fois la notification envoyée).",
        "Jusqu'à désactivation par l'utilisateur ou suppression du compte.",
        "Row Level Security, HTTPS.",
        "Non.",
        [],
    ),
    (
        "Lecture de tickets de caisse par IA (optionnel)",
        "Extraire automatiquement les articles et les prix d'une photo de ticket de caisse.",
        "Utilisateurs utilisant cette fonctionnalité",
        "Photo du ticket de caisse (peut révéler le magasin fréquenté et les achats ; ne contient pas de donnée d'identité de l'utilisateur).",
        "Consentement (action volontaire : l'utilisateur choisit de scanner un ticket).",
        "Anthropic (sous-traitant IA, États-Unis).",
        "Non conservée par whaoo au-delà de l'analyse. Politique de rétention côté Anthropic à vérifier (DPA / conditions d'utilisation API).",
        "Connexion chiffrée (HTTPS/TLS) vers l'API du prestataire.",
        "Oui — États-Unis.",
        [6, 8],
    ),
    (
        "Transcription vocale de secours (optionnel, Safari)",
        "Convertir la voix en texte pour la dictée vocale sur les navigateurs qui ne le font pas nativement (Safari iOS/iPadOS).",
        "Utilisateurs Safari iOS/iPadOS utilisant la dictée vocale",
        "Enregistrement audio de la voix de l'utilisateur.",
        "Consentement (action volontaire : l'utilisateur active le micro).",
        "OpenAI (sous-traitant IA, États-Unis).",
        "Non conservée par whaoo. Politique de rétention côté OpenAI à vérifier (DPA / conditions d'utilisation API).",
        "Connexion chiffrée (HTTPS/TLS) vers l'API du prestataire.",
        "Oui — États-Unis.",
        [6, 8],
    ),
    (
        "Message vocal de bienvenue / au revoir (optionnel)",
        "Prononcer à voix haute \"Bonjour {prénom}\" à la connexion et \"Au revoir {prénom}\" à la déconnexion.",
        "Utilisateurs connectés",
        "Prénom de l'utilisateur.",
        "À confirmer : exécution du contrat / intérêt légitime, ou consentement si tu préfères rendre cette fonctionnalité désactivable.",
        "ElevenLabs (sous-traitant IA, États-Unis).",
        "Non conservée par whaoo ; le son est généré à la volée à chaque connexion/déconnexion et n'est pas stocké.",
        "Connexion chiffrée (HTTPS/TLS), route API protégée par une vérification d'authentification (l'appel n'est possible que pour un utilisateur connecté).",
        "Oui — États-Unis.",
        [4, 8],
    ),
    (
        "Contributions communautaires de prix",
        "Améliorer les estimations de prix partagées entre tous les utilisateurs.",
        "Utilisateurs contribuant volontairement un prix",
        "Nom d'article normalisé, enseigne (optionnel), prix.",
        "Consentement (action volontaire de contribution).",
        "Supabase. Seuls des agrégats anonymisés (prix moyen, nombre de contributions) sont visibles par les autres utilisateurs — jamais l'identité du contributeur.",
        "Durée de vie du compte du contributeur.",
        "Row Level Security ; fonction d'agrégation en base empêchant techniquement de retrouver qui a soumis quel prix.",
        "Non.",
        [],
    ),
]

r = header_row + 1
for row_data in rows:
    name, purpose, people, data_cat, legal, recipients, retention, security, transfer, to_fill = row_data
    values = [name, purpose, people, data_cat, legal, recipients, retention, security, transfer]
    is_band = ((r - header_row) % 2 == 0)
    for i, val in enumerate(values, start=1):
        c = ws.cell(row=r, column=i, value=val)
        c.font = BODY_BOLD if i == 1 else BODY
        c.alignment = WRAP_TOP
        c.border = BORDER
        if is_band and (i - 1) not in to_fill:
            c.fill = BAND_FILL
        if (i - 1) in to_fill:
            c.fill = TOFILL_FILL
    ws.row_dimensions[r].height = 62
    r += 1

# Ligne d'exemple pour une future fonctionnalite
example_row = r
example_values = [
    "[Nom de la nouvelle fonctionnalité]",
    "[Pourquoi cette donnée est traitée]",
    "[Qui est concerné]",
    "[Quelles données précisément]",
    "[Contrat / consentement / obligation légale / intérêt légitime]",
    "[Qui reçoit la donnée, y compris les sous-traitants tiers]",
    "[Combien de temps la donnée est gardée]",
    "[Mesures techniques et organisationnelles]",
    "[Oui/Non + pays + garanties si oui]",
]
for i, val in enumerate(example_values, start=1):
    c = ws.cell(row=example_row, column=i, value=val)
    c.font = Font(name=FONT_NAME, size=10, italic=True, color="9CA3AF")
    c.alignment = WRAP_TOP
    c.border = BORDER
    c.fill = TOFILL_FILL
ws.row_dimensions[example_row].height = 62

ws.merge_cells(f"A{example_row + 2}:I{example_row + 2}")
note = ws.cell(
    row=example_row + 2,
    column=1,
    value=(
        "Ligne d'exemple ci-dessus (en italique) : duplique-la et remplis-la à chaque nouveau "
        "traitement de données personnelles ajouté à l'application."
    ),
)
note.font = ITALIC_GRAY
note.alignment = WRAP_TOP

wb.save(OUT)
print("OK ->", OUT)
