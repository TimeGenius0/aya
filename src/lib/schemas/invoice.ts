import { z } from "zod";

export const INVOICE_STATUSES = ["brouillon", "emise", "payee", "annulee"] as const;

export const INVOICE_STATUS_LABELS: Record<(typeof INVOICE_STATUSES)[number], string> = {
  brouillon: "Brouillon",
  emise: "Émise",
  payee: "Payée",
  annulee: "Annulée",
};

export const generateInvoiceSchema = z.object({
  noteId: z.string().uuid(),
  taxRate: z.coerce.number().min(0).max(100).default(0),
});
export type GenerateInvoiceInput = z.infer<typeof generateInvoiceSchema>;

export const updateInvoiceStatusSchema = z.object({
  invoiceId: z.string().uuid(),
  status: z.enum(INVOICE_STATUSES),
});
export type UpdateInvoiceStatusInput = z.infer<typeof updateInvoiceStatusSchema>;

export const DEFAULT_CURRENCY = "TND";
