import { prisma } from "@/lib/prisma";
import { DEFAULT_CURRENCY } from "@/lib/schemas/invoice";

export async function getClinicSettings() {
  const settings = await prisma.clinicSettings.findUnique({ where: { id: 1 } });
  // The seed row is created by the setup SQL, but fall back gracefully if it
  // was ever missing rather than throwing on every invoice/settings page.
  return (
    settings ??
    (await prisma.clinicSettings.upsert({
      where: { id: 1 },
      create: { id: 1 },
      update: {},
    }))
  );
}

export async function updateClinicSettings(fields: {
  name?: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  defaultTaxRate?: number;
}) {
  return prisma.clinicSettings.upsert({
    where: { id: 1 },
    create: { id: 1, ...fields },
    update: { ...fields, updatedAt: new Date() },
  });
}

export async function listInvoices(opts: { clientId?: string; status?: string; limit?: number; offset?: number }) {
  const { clientId, status, limit = 50, offset = 0 } = opts;
  const where = {
    ...(clientId && { clientId }),
    ...(status && { status }),
  };

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      orderBy: { issuedAt: "desc" },
      take: limit,
      skip: offset,
      include: { client: true, animal: true },
    }),
    prisma.invoice.count({ where }),
  ]);

  return { invoices, total };
}

export async function getInvoice(invoiceId: string) {
  return prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      client: true,
      animal: true,
      consultation: true,
      lineItems: { orderBy: { sortOrder: "asc" } },
    },
  });
}

/**
 * Snapshots a note's line items into a new invoice. Line items are copied
 * (not referenced) so later edits to the note never retroactively change an
 * already-issued invoice.
 */
export async function generateInvoiceFromNote(noteId: string, taxRate: number, staffId: string | null) {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    include: { lineItems: true, animal: true },
  });
  if (!note) throw new Error("Note introuvable");
  if (note.lineItems.length === 0) throw new Error("Cette note ne contient aucune ligne facturable");

  const subtotal = note.lineItems.reduce(
    (sum, li) => sum + Number(li.quantity) * Number(li.unitPrice),
    0
  );
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  const [{ generate_invoice_number: invoiceNumber }] = await prisma.$queryRaw<
    { generate_invoice_number: string }[]
  >`SELECT public.generate_invoice_number()`;

  return prisma.invoice.create({
    data: {
      invoiceNumber,
      clientId: note.animal.clientId,
      animalId: note.animalId,
      consultationId: note.consultationId,
      noteId: note.id,
      currency: DEFAULT_CURRENCY,
      subtotal,
      taxRate,
      taxAmount,
      total,
      status: "emise",
      createdBy: staffId,
      lineItems: {
        create: note.lineItems.map((li, index) => ({
          description: li.description,
          quantity: li.quantity,
          unitPrice: li.unitPrice,
          lineTotal: Number(li.quantity) * Number(li.unitPrice),
          sortOrder: index,
        })),
      },
    },
    include: { lineItems: true, client: true, animal: true },
  });
}

export async function updateInvoiceStatus(invoiceId: string, status: string) {
  return prisma.invoice.update({ where: { id: invoiceId }, data: { status } });
}
