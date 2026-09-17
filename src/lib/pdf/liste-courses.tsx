import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 12, fontFamily: "Helvetica" },
  titre: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  sousTitre: { fontSize: 11, color: "#6B6255", marginBottom: 20 },
  ligne: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E4DECB",
    paddingVertical: 8,
  },
  case_: {
    width: 14,
    height: 14,
    borderWidth: 1.5,
    borderColor: "#2B3A32",
    marginRight: 10,
  },
  labelCol: { flex: 3 },
  detailCol: { flex: 2, color: "#6B6255" },
  qtyCol: { flex: 1, textAlign: "right" },
  vide: { marginTop: 20, color: "#6B6255", fontStyle: "italic" },
});

export type ArticleListe = {
  label: string;
  detail?: string | null;
  quantity: number;
};

export function ListeCoursesPDF({ articles }: { articles: ArticleListe[] }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.titre}>whaoo — Liste de courses</Text>
        <Text style={styles.sousTitre}>À acheter</Text>

        {articles.length === 0 ? (
          <Text style={styles.vide}>Rien à acheter pour l&apos;instant.</Text>
        ) : (
          articles.map((article, i) => (
            <View style={styles.ligne} key={i}>
              <View style={styles.case_} />
              <Text style={styles.labelCol}>{article.label}</Text>
              <Text style={styles.detailCol}>{article.detail ?? ""}</Text>
              <Text style={styles.qtyCol}>
                {article.quantity > 1 ? `x${article.quantity}` : ""}
              </Text>
            </View>
          ))
        )}
      </Page>
    </Document>
  );
}
