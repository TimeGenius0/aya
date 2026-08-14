"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { generateInvoiceSchema, updateInvoiceStatusSchema } from "@/lib/schemas/invoice";
import * as invoicesData from "@/lib/data/invoices";
import { type ActionResult, fieldErrorsFrom } from "./shared";

export async function generateInvoiceAction(formValues: unknown): Promise<ActionResult<{ id: string }>> {
  const { staff } = await requireStaff();
  const parsed = generateInvoiceSchema.safeParse(formValues);
  if (!parsed.success) {
    return { ok: false, error: "Vérifiez les champs.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  try {
    const invoice = await invoicesData.generateInvoiceFromNote(parsed.data.noteId, parsed.data.taxRate, staff.id);
    revalidatePath("/invoices");
    revalidatePath(`/notes/${parsed.data.noteId}`);
    return { ok: true, data: { id: invoice.id } };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Impossible de générer la facture." };
  }
}

export async function updateInvoiceStatusAction(
  formValues: unknown
): Promise<ActionResult<{ id: string }>> {
  await requireStaff();
  const parsed = updateInvoiceStatusSchema.safeParse(formValues);
  if (!parsed.success) {
    return { ok: false, error: "Statut invalide." };
  }

  const invoice = await invoicesData.updateInvoiceStatus(parsed.data.invoiceId, parsed.data.status);
  revalidatePath(`/invoices/${invoice.id}`);
  revalidatePath("/invoices");
  return { ok: true, data: { id: invoice.id } };
}
