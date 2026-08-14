"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { createNoteSchema } from "@/lib/schemas/note";
import * as notesData from "@/lib/data/notes";
import { type ActionResult, fieldErrorsFrom } from "./shared";

export async function createNoteAction(formValues: unknown): Promise<ActionResult<{ id: string }>> {
  const { staff } = await requireStaff();
  const parsed = createNoteSchema.safeParse(formValues);
  if (!parsed.success) {
    return { ok: false, error: "Vérifiez les champs du formulaire.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const note = await notesData.createNote(parsed.data, staff.id);
  revalidatePath(`/animals/${parsed.data.animalId}`);
  return { ok: true, data: { id: note.id } };
}
