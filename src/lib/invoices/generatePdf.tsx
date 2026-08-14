import { renderToBuffer } from "@react-pdf/renderer";
import { InvoiceTemplate } from "@/pdf/InvoiceTemplate";
import { getInvoice, getClinicSettings } from "@/lib/data/invoices";

export async function renderInvoicePdf(invoiceId: string) {
  const [invoice, clinic] = await Promise.all([getInvoice(invoiceId), getClinicSettings()]);
  if (!invoice) return null;

  const element = (
    <InvoiceTemplate
      clinic={{
        name: clinic.name,
        address: clinic.address,
        phone: clinic.phone,
        email: clinic.email,
      }}
      invoice={{
        invoiceNumber: invoice.invoiceNumber,
        issuedAt: invoice.issuedAt,
        currency: invoice.currency,
        subtotal: Number(invoice.subtotal),
        taxRate: Number(invoice.taxRate),
        taxAmount: Number(invoice.taxAmount),
        total: Number(invoice.total),
      }}
      client={{
        fullName: invoice.client.fullName,
        phone: invoice.client.phone,
        email: invoice.client.email,
        address: invoice.client.address,
      }}
      animal={invoice.animal ? { name: invoice.animal.name, species: invoice.animal.species } : null}
      lineItems={invoice.lineItems.map((li) => ({
        description: li.description,
        quantity: Number(li.quantity),
        unitPrice: Number(li.unitPrice),
        lineTotal: Number(li.lineTotal),
      }))}
    />
  );

  return { buffer: await renderToBuffer(element), invoiceNumber: invoice.invoiceNumber };
}
