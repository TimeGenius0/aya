"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { createConsultationSchema, updateConsultationSchema } from "@/lib/schemas/consultation";
import * as consultationsData from "@/lib/data/consultations";
import { type ActionResult, fieldErrorsFrom } from "./shared";

export async function createConsultationAction(
  formValues: unknown
): Promise<ActionResult<{ id: string }>> {
  const { staff } = await requireStaff();
  const parsed = createConsultationSchema.safeParse(formValues);
  if (!parsed.success) {
    return { ok: false, error: "Vérifiez les champs du formulaire.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const consultation = await consultationsData.createConsultation(parsed.data, staff.id);
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  revalidatePath(`/animals/${consultation.animalId}`);
  return { ok: true, data: { id: consultation.id } };
}

export async function updateConsultationAction(
  formValues: unknown
): Promise<ActionResult<{ id: string }>> {
  await requireStaff();
  const parsed = updateConsultationSchema.safeParse(formValues);
  if (!parsed.success) {
    return { ok: false, error: "Vérifiez les champs du formulaire.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const consultation = await consultationsData.updateConsultation(parsed.data);
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  revalidatePath(`/consultations/${consultation.id}`);
  revalidatePath(`/animals/${consultation.animalId}`);
  return { ok: true, data: { id: consultation.id } };
}
