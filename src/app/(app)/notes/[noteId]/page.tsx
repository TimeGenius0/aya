import Link from "next/link";
import { notFound } from "next/navigation";
import { getNote } from "@/lib/data/notes";
import { getClinicSettings } from "@/lib/data/invoices";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { NOTE_LINE_ITEM_KIND_LABELS } from "@/lib/schemas/note";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { GenerateInvoiceButton } from "@/components/invoices/GenerateInvoiceButton";

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ noteId: string }>;
}) {
  const { noteId } = await params;
  const note = await getNote(noteId);
  if (!note) notFound();
  const clinicSettings = await getClinicSettings();

  const total = note.lineItems.reduce(
    (sum, li) => sum + Number(li.quantity) * Number(li.unitPrice),
    0
  );
  const existingInvoice = note.invoices[0];

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Note de traitement"
        subtitle={
          <Link href={`/animals/${note.animalId}`} className="hover:underline">
            {note.animal.name} — {note.animal.client.fullName}
          </Link>
        }
      />

      <Card>
        <CardBody className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {formatDateTime(note.createdAt)}
            {note.author && ` · ${note.author.fullName}`}
          </p>

          {note.freeText && <p className="whitespace-pre-wrap text-sm">{note.freeText}</p>}

          {note.lineItems.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-surface-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Type</th>
                    <th className="px-3 py-2 font-medium">Description</th>
                    <th className="px-3 py-2 text-right font-medium">Qté</th>
                    <th className="px-3 py-2 text-right font-medium">Prix unit.</th>
                    <th className="px-3 py-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {note.lineItems.map((li) => (
                    <tr key={li.id}>
                      <td className="px-3 py-2">
                        {NOTE_LINE_ITEM_KIND_LABELS[li.kind as keyof typeof NOTE_LINE_ITEM_KIND_LABELS] ?? li.kind}
                      </td>
                      <td className="px-3 py-2">{li.description}</td>
                      <td className="px-3 py-2 text-right">{li.quantity.toString()}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(Number(li.unitPrice))}</td>
                      <td className="px-3 py-2 text-right">
                        {formatCurrency(Number(li.quantity) * Number(li.unitPrice))}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border font-medium">
                    <td colSpan={4} className="px-3 py-2 text-right">
                      Total
                    </td>
                    <td className="px-3 py-2 text-right">{formatCurrency(total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          <div className="flex justify-end pt-2">
            {existingInvoice ? (
              <ButtonLink href={`/invoices/${existingInvoice.id}`} variant="secondary">
                Voir la facture {existingInvoice.invoiceNumber}
              </ButtonLink>
            ) : note.lineItems.length > 0 ? (
              <GenerateInvoiceButton noteId={note.id} defaultTaxRate={Number(clinicSettings.defaultTaxRate)} />
            ) : null}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
