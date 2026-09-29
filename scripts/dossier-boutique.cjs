/* eslint-disable @typescript-eslint/no-require-imports -- script Node en CommonJS, hors application */
// Génère le PDF versionné du dossier boutique à partir de
// livrables/boutique/dossier-boutique.html et de l'entrée la plus récente
// de livrables/boutique/VERSIONS.md. Lancer via scripts/dossier-boutique.sh.
const fs = require("fs");
const os = require("os");
const path = require("path");

const dossier = path.join(__dirname, "..", "livrables", "boutique");
const journal = fs.readFileSync(path.join(dossier, "VERSIONS.md"), "utf8");

// Entrées « ## vX.Y — AAAA-MM-JJ » suivies de leurs puces, la plus récente
// en premier.
const entrees = journal
  .split(/^## /m)
  .slice(1)
  .map((bloc) => bloc.match(/^v(\d+\.\d+) — (\d{4}-\d{2}-\d{2})\n([\s\S]*)$/))
  .filter(Boolean);
if (!entrees.length) {
  console.error("Aucune entrée « ## vX.Y — AAAA-MM-JJ » dans VERSIONS.md.");
  process.exit(1);
}
const [, version, date] = entrees[0];

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const dateFr = (iso) => {
  const [a, m, j] = iso.split("-").map(Number);
  return `${j} ${MOIS[m - 1]} ${a}`;
};
const echapper = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Journal Markdown (titres et listes à puces) → HTML.
const versionsHtml = entrees
  .map(([, v, d, corps]) => {
    const items = corps
      .split(/\n(?=- )/)
      .map((l) => l.trim())
      .filter((l) => l.startsWith("- "))
      .map((l) => `<li>${echapper(l.slice(2).replace(/\s*\n\s*/g, " "))}</li>`)
      .join("");
    return `<h3>v${v} — ${dateFr(d)}</h3><ul>${items}</ul>`;
  })
  .join("\n");

const html = fs
  .readFileSync(path.join(dossier, "dossier-boutique.html"), "utf8")
  .replaceAll("{{VERSION}}", `v${version}`)
  .replaceAll("{{DATE}}", dateFr(date))
  .replace("<!-- VERSIONS -->", versionsHtml);

const tmp = path.join(os.tmpdir(), `dossier-boutique-${process.pid}.html`);
fs.writeFileSync(tmp, html);
const sortie = path.join(dossier, `whaoo-dossier-boutique-v${version}-${date}.pdf`);

(async () => {
  const { chromium } = require("playwright");
  const executablePath = fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined;
  const navigateur = await chromium.launch({ executablePath });
  const page = await navigateur.newPage();
  await page.goto(`file://${tmp}`, { waitUntil: "load" });
  await page.pdf({ path: sortie, format: "A4", printBackground: true, preferCSSPageSize: true });
  await navigateur.close();
  fs.unlinkSync(tmp);
  console.log(`Dossier v${version} : ${sortie}`);
})();
