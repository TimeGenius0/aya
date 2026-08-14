import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

// Helvetica is one of the 14 standard PDF fonts — no font file to embed or
// fetch, which matters for a serverless function with no guaranteed network
// access to a font CDN at render time.
const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#17262A" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 28 },
  clinicName: { fontSize: 16, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  muted: { color: "#55696B" },
  invoiceTitle: { fontSize: 20, fontFamily: "Helvetica-Bold", textAlign: "right" },
  invoiceMeta: { textAlign: "right", marginTop: 4 },
  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 8,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#55696B",
    marginBottom: 4,
  },
  billTo: { fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  table: { marginTop: 8, borderTop: "1 solid #D9E1DE" },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #D9E1DE",
    paddingVertical: 6,
  },
  tableHeaderRow: {
    flexDirection: "row",
    paddingVertical: 6,
    backgroundColor: "#EAF0EE",
  },
  colDescription: { flex: 4 },
  colQty: { flex: 1, textAlign: "right" },
  colUnit: { flex: 1.4, textAlign: "right" },
  colTotal: { flex: 1.4, textAlign: "right" },
  headerCell: { fontFamily: "Helvetica-Bold", fontSize: 8, textTransform: "uppercase", color: "#55696B" },
  totals: { marginTop: 12, alignItems: "flex-end" },
  totalsRow: { flexDirection: "row", width: 200, justifyContent: "space-between", marginBottom: 3 },
  grandTotalRow: {
    flexDirection: "row",
    width: 200,
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 6,
    borderTop: "1 solid #17262A",
  },
  grandTotalLabel: { fontFamily: "Helvetica-Bold" },
  grandTotalValue: { fontFamily: "Helvetica-Bold" },
  footer: { position: "absolute", bottom: 32, left: 40, right: 40, fontSize: 8, color: "#93A6A3", textAlign: "center" },
});

function money(amount: number, currency: string) {
  return `${amount.toFixed(3)} ${currency}`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date);
}

export interface InvoicePdfProps {
  clinic: {
    name: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
  };
  invoice: {
    invoiceNumber: string;
    issuedAt: Date;
    currency: string;
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
  };
  client: {
    fullName: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
  };
  animal?: { name: string; species: string } | null;
  lineItems: { description: string; quantity: number; unitPrice: number; lineTotal: number }[];
}

export function InvoiceTemplate({ clinic, invoice, client, animal, lineItems }: InvoicePdfProps) {
  return (
    <Document title={`Facture ${invoice.invoiceNumber}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.clinicName}>{clinic.name}</Text>
            {clinic.address && <Text style={styles.muted}>{clinic.address}</Text>}
            {clinic.phone && <Text style={styles.muted}>{clinic.phone}</Text>}
            {clinic.email && <Text style={styles.muted}>{clinic.email}</Text>}
          </View>
          <View>
            <Text style={styles.invoiceTitle}>FACTURE</Text>
            <Text style={styles.invoiceMeta}>N° {invoice.invoiceNumber}</Text>
            <Text style={[styles.invoiceMeta, styles.muted]}>{formatDate(invoice.issuedAt)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Facturé à</Text>
          <Text style={styles.billTo}>{client.fullName}</Text>
          {animal && (
            <Text style={styles.muted}>
              Animal : {animal.name} ({animal.species})
            </Text>
          )}
          {client.address && <Text style={styles.muted}>{client.address}</Text>}
          {client.phone && <Text style={styles.muted}>{client.phone}</Text>}
          {client.email && <Text style={styles.muted}>{client.email}</Text>}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colDescription, styles.headerCell]}>Description</Text>
            <Text style={[styles.colQty, styles.headerCell]}>Qté</Text>
            <Text style={[styles.colUnit, styles.headerCell]}>Prix unit.</Text>
            <Text style={[styles.colTotal, styles.headerCell]}>Total</Text>
          </View>
          {lineItems.map((item, i) => (
            <View style={styles.tableRow} key={i}>
              <Text style={styles.colDescription}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colUnit}>{money(item.unitPrice, invoice.currency)}</Text>
              <Text style={styles.colTotal}>{money(item.lineTotal, invoice.currency)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalsRow}>
            <Text style={styles.muted}>Sous-total</Text>
            <Text>{money(invoice.subtotal, invoice.currency)}</Text>
          </View>
          {invoice.taxRate > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.muted}>TVA ({invoice.taxRate}%)</Text>
              <Text>{money(invoice.taxAmount, invoice.currency)}</Text>
            </View>
          )}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{money(invoice.total, invoice.currency)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>{clinic.name} — Merci de votre confiance.</Text>
      </Page>
    </Document>
  );
}
