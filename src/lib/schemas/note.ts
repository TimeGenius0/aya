import { z } from "zod";
import { optionalTrimmedString } from "./common";

export const NOTE_LINE_ITEM_KINDS = ["traitement", "produit", "acte"] as const;

export const NOTE_LINE_ITEM_KIND_LABELS: Record<
  (typeof NOTE_LINE_ITEM_KINDS)[number],
  string
> = {
  traitement: "Traitement",
  produit: "Produit vendu",
  acte: "Acte",
};

export const noteLineItemSchema = z.object({
  kind: z.enum(NOTE_LINE_ITEM_KINDS),
  description: z.string().trim().min(1, "La description est requise"),
  quantity: z.coerce.number().positive().default(1),
  unitPrice: z.coerce.number().nonnegative().default(0),
});
export type NoteLineItemInput = z.infer<typeof noteLineItemSchema>;

export const noteFieldsSchema = z.object({
  animalId: z.string().uuid(),
  consultationId: z.string().uuid().nullable().optional(),
  freeText: optionalTrimmedString,
  lineItems: z.array(noteLineItemSchema).default([]),
});

export const createNoteSchema = noteFieldsSchema;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;

export const updateNoteSchema = noteFieldsSchema.partial().extend({
  noteId: z.string().uuid(),
});
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
