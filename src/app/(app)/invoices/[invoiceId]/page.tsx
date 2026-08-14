import Link from "next/link";
import { notFound } from "next/navigation";
import { getInvoice } from "@/lib/data/invoices";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { InvoiceStatusForm } from "@/components/invoices/InvoiceStatusForm";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
  const invoice = await getInvoice(invoiceId);
  if (!invoice) notFound();

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={`Facture ${invoice.invoiceNumber}`}
        subtitle={
          <Link href={`/clients/${invoice.clientId}`} className="hover:underline">
            {invoice.client.fullName}
          </Link>
        }
        action={
          <ButtonLink href={`/invoices/${invoice.id}/pdf`}>
            Télécharger le PDF
          </ButtonLink>
        }
      />

      <div className="space-y-5">
        <Card>
          <CardBody className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Émise le</p>
              <p className="font-medium">{formatDate(invoice.issuedAt)}</p>
            </div>
            {invoice.animal && (
              <div>
                <p className="text-sm text-muted-foreground">Animal</p>
                <p className="font-medium">{invoice.animal.name}</p>
              </div>
            )}
            <div>
              <p className="mb-1 text-sm text-muted-foreground">Statut</p>
              <InvoiceStatusForm invoiceId={invoice.id} status={invoice.status} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-surface-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Description</th>
                    <th className="px-3 py-2 text-right font-medium">Qté</th>
                    <th className="px-3 py-2 text-right font-medium">Prix unit.</th>
                    <th className="px-3 py-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoice.lineItems.map((li) => (
                    <tr key={li.id}>
                      <td className="px-3 py-2">{li.description}</td>
                      <td className="px-3 py-2 text-right">{li.quantity.toString()}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(Number(li.unitPrice), invoice.currency)}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(Number(li.lineTotal), invoice.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end">
              <div className="w-56 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span>{formatCurrency(Number(invoice.subtotal), invoice.currency)}</span>
                </div>
                {Number(invoice.taxRate) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">TVA ({invoice.taxRate.toString()}%)</span>
                    <span>{formatCurrency(Number(invoice.taxAmount), invoice.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-1 font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(Number(invoice.total), invoice.currency)}</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
