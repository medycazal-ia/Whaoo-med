import type { ArticleCourse } from "@/components/courses-dashboard";

export const DEMO_COOKIE = "whaoo_demo";

export type DemoState = {
  budgetAmount: number;
  items: ArticleCourse[];
};

export type DemoMoisHistorique = {
  mois: string;
  budgetAmount: number;
  totalDepense: number;
};

// Jeu de données factices réaliste (section 4 du cahier des charges).
// Ne touche jamais la base de données réelle ni un connecteur externe :
// tout vit dans un cookie de session, recréé à chaque nouvelle session.
export function etatDemoParDefaut(): DemoState {
  return {
    budgetAmount: 350,
    items: [
      { id: "d1", label: "Pommes", price: 3.2, quantity: 1, status: "achete" },
      { id: "d2", label: "Pain de mie", price: 1.85, quantity: 1, status: "achete" },
      { id: "d3", label: "Yaourts nature", price: 2.4, quantity: 2, status: "achete" },
      { id: "d4", label: "Poulet fermier", price: 8.9, quantity: 1, status: "achete" },
      { id: "d5", label: "Pâtes", price: 1.1, quantity: 3, status: "achete" },
      { id: "d6", label: "Café moulu", price: 5.5, quantity: 1, status: "achete" },
      { id: "d7", label: "Lait demi-écrémé", price: 1.15, quantity: 2, status: "achete" },
      { id: "d8", label: "Savon", price: 2.3, quantity: 1, status: "achete" },
      { id: "d9", label: "Papier toilette", price: 6.9, quantity: 1, status: "achete" },
      { id: "d10", label: "Saumon fumé", price: 4.5, quantity: 1, status: "a_acheter" },
      { id: "d11", label: "Fromage de chèvre", price: 3.6, quantity: 1, status: "a_acheter" },
      { id: "d12", label: "Lessive", price: 9.9, quantity: 1, status: "a_acheter" },
      { id: "d13", label: "Chocolat noir", price: 2.1, quantity: 2, status: "a_acheter" },
      { id: "d14", label: "Vin rouge", price: 7.5, quantity: 1, status: "a_acheter" },
      { id: "d15", label: "Bougies parfumées", price: 6.0, quantity: 1, status: "a_acheter" },
    ],
  };
}

export function historiqueDemo(): DemoMoisHistorique[] {
  return [
    { mois: "Juillet", budgetAmount: 340, totalDepense: 298.4 },
    { mois: "Août", budgetAmount: 350, totalDepense: 362.1 },
    { mois: "Septembre", budgetAmount: 350, totalDepense: 210.5 },
  ];
}

type CookieReader = { get(name: string): { value: string } | undefined };

export function lireEtatDemo(cookieStore: CookieReader): DemoState {
  const brut = cookieStore.get(DEMO_COOKIE)?.value;
  if (!brut) return etatDemoParDefaut();

  try {
    const parsed = JSON.parse(brut) as DemoState;
    if (!Array.isArray(parsed.items) || typeof parsed.budgetAmount !== "number") {
      return etatDemoParDefaut();
    }
    return parsed;
  } catch {
    return etatDemoParDefaut();
  }
}
