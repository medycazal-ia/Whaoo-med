// Émulateur d'écran — v2 : redimensionne la fenêtre du navigateur
// elle-même (chrome.windows.update), au lieu d'une émulation CDP via
// chrome.debugger. Moins précis au pixel près (la zone de page affichée
// est un peu plus petite que la fenêtre, à cause de la barre d'adresse
// et des onglets), mais ça marche partout, sans permission spéciale ni
// bandeau d'avertissement — contrairement à l'approche précédente, qui
// se heurtait à une restriction sur certains Chromebooks.

const statutEl = document.getElementById("statut");
const erreurEl = document.getElementById("erreur");
const largeurEl = document.getElementById("largeur");
const hauteurEl = document.getElementById("hauteur");

function afficherErreur(message) {
  erreurEl.textContent = message;
  erreurEl.hidden = false;
}

function masquerErreur() {
  erreurEl.hidden = true;
}

function marquerPresetActif(largeur, hauteur) {
  document.querySelectorAll(".preset").forEach((bouton) => {
    const correspond = Number(bouton.dataset.w) === largeur && Number(bouton.dataset.h) === hauteur;
    bouton.classList.toggle("actif", correspond);
  });
}

async function fenetreCourante() {
  return chrome.windows.getCurrent();
}

async function rafraichirStatut() {
  try {
    const fenetre = await fenetreCourante();
    statutEl.textContent = `Fenêtre actuelle : ${fenetre.width} × ${fenetre.height} px`;
    marquerPresetActif(fenetre.width, fenetre.height);
  } catch {
    statutEl.textContent = "";
  }
}

async function redimensionner(width, height) {
  masquerErreur();
  try {
    const fenetre = await fenetreCourante();
    await chrome.windows.update(fenetre.id, {
      width,
      height,
      state: "normal",
      left: fenetre.left ?? 0,
      top: fenetre.top ?? 0,
    });
    await rafraichirStatut();
  } catch (erreur) {
    afficherErreur(
      "Impossible de redimensionner la fenêtre : " + (erreur.message || erreur),
    );
  }
}

document.querySelectorAll(".preset").forEach((bouton) => {
  bouton.addEventListener("click", () => {
    redimensionner(Number(bouton.dataset.w), Number(bouton.dataset.h));
  });
});

document.getElementById("appliquerPerso").addEventListener("click", () => {
  const largeur = Number(largeurEl.value);
  const hauteur = Number(hauteurEl.value);
  if (!largeur || !hauteur || largeur < 200 || hauteur < 200) {
    afficherErreur("Indique une largeur et une hauteur d'au moins 200 px.");
    return;
  }
  redimensionner(largeur, hauteur);
});

document.getElementById("restaurer").addEventListener("click", async () => {
  masquerErreur();
  try {
    const fenetre = await fenetreCourante();
    await chrome.windows.update(fenetre.id, { state: "maximized" });
    await rafraichirStatut();
  } catch (erreur) {
    afficherErreur("Impossible d'agrandir la fenêtre : " + (erreur.message || erreur));
  }
});

rafraichirStatut();
