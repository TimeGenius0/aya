import Link from "next/link";
import { listInvoices } from "@/lib/data/invoices";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge, INVOICE_STATUS_TONE } from "@/components/ui/Badge";
import { INVOICE_STATUS_LABELS } from "@/lib/schemas/invoice";
import { formatCurrency, formatDate } from "@/lib/utils";
import { InvoiceIcon } from "@/components/layout/icons";

export default async function InvoicesPage() {
  const { invoices, total } = await listInvoices({ limit: 100 });

  return (
    <div>
      <PageHeader title="Factures" subtitle={`${total} facture${total > 1 ? "s" : ""}`} />

      {invoices.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <InvoiceIcon className="text-muted-foreground" width={28} height={28} />
          <p className="text-sm text-muted-foreground">
            Aucune facture pour l&apos;instant — générez-en une depuis une note de traitement.
          </p>
        </Card>
      ) : (
        <Card className="divide-y divide-border overflow-hidden">
          {invoices.map((invoice) => (
            <Link
              key={invoice.id}
              href={`/invoices/${invoice.id}`}
              className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-surface-muted"
            >
              <div className="min-w-0">
                <p className="font-medium">
                  {invoice.invoiceNumber} — {invoice.client.fullName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(invoice.issuedAt)}
                  {invoice.animal && ` · ${invoice.animal.name}`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="font-medium tabular-nums">{formatCurrency(Number(invoice.total), invoice.currency)}</span>
                <Badge tone={INVOICE_STATUS_TONE[invoice.status]}>
                  {INVOICE_STATUS_LABELS[invoice.status as keyof typeof INVOICE_STATUS_LABELS] ?? invoice.status}
                </Badge>
              </div>
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
