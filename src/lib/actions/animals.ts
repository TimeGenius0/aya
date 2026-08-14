"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { createAnimalSchema, updateAnimalSchema } from "@/lib/schemas/animal";
import * as animalsData from "@/lib/data/animals";
import { type ActionResult, fieldErrorsFrom } from "./shared";

export async function createAnimalAction(formValues: unknown): Promise<ActionResult<{ id: string }>> {
  await requireStaff();
  const parsed = createAnimalSchema.safeParse(formValues);
  if (!parsed.success) {
    return { ok: false, error: "Vérifiez les champs du formulaire.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const animal = await animalsData.createAnimal(parsed.data);
  revalidatePath(`/clients/${parsed.data.clientId}`);
  return { ok: true, data: { id: animal.id } };
}

export async function updateAnimalAction(formValues: unknown): Promise<ActionResult<{ id: string }>> {
  await requireStaff();
  const parsed = updateAnimalSchema.safeParse(formValues);
  if (!parsed.success) {
    return { ok: false, error: "Vérifiez les champs du formulaire.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const animal = await animalsData.updateAnimal(parsed.data);
  revalidatePath(`/animals/${animal.id}`);
  revalidatePath(`/clients/${animal.clientId}`);
  return { ok: true, data: { id: animal.id } };
}
