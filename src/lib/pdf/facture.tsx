import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, fontFamily: "Helvetica" },
  titre: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  sousTitre: { fontSize: 11, color: "#6B6255", marginBottom: 20 },
  ligne: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E4DECB",
    paddingVertical: 6,
  },
  labelCol: { flex: 3 },
  detailCol: { flex: 2, color: "#6B6255" },
  qtyCol: { flex: 1, textAlign: "right" },
  prixCol: { flex: 1, textAlign: "right" },
  total: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: "#2B3A32",
    fontSize: 13,
    fontWeight: 700,
  },
  budgetLigne: { marginTop: 4, color: "#6B6255" },
});

export type ArticleFacture = {
  label: string;
  detail?: string | null;
  price: number;
  quantity: number;
};

export function FacturePDF({
  moisLabel,
  articles,
  budgetAmount,
}: {
  moisLabel: string;
  articles: ArticleFacture[];
  budgetAmount: number;
}) {
  const total = articles.reduce((s, a) => s + a.price * a.quantity, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.titre}>whaoo — Facture du mois</Text>
        <Text style={styles.sousTitre}>{moisLabel}</Text>

        <View style={styles.ligne}>
          <Text style={styles.labelCol}>Article</Text>
          <Text style={styles.detailCol}>Détail</Text>
          <Text style={styles.qtyCol}>Qté</Text>
          <Text style={styles.prixCol}>Prix</Text>
        </View>

        {articles.map((article, i) => (
          <View style={styles.ligne} key={i}>
            <Text style={styles.labelCol}>{article.label}</Text>
            <Text style={styles.detailCol}>{article.detail ?? ""}</Text>
            <Text style={styles.qtyCol}>{article.quantity}</Text>
            <Text style={styles.prixCol}>
              {(article.price * article.quantity).toFixed(2)} €
            </Text>
          </View>
        ))}

        <View style={styles.total}>
          <Text>Total dépensé</Text>
          <Text>{total.toFixed(2)} €</Text>
        </View>
        <Text style={styles.budgetLigne}>
          Budget du mois : {budgetAmount.toFixed(2)} €
        </Text>
      </Page>
    </Document>
  );
}
