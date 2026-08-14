"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import * as invoicesData from "@/lib/data/invoices";
import { optionalTrimmedString } from "@/lib/schemas/common";
import { type ActionResult, fieldErrorsFrom } from "./shared";

const clinicSettingsSchema = z.object({
  name: z.string().trim().min(1, "Le nom du cabinet est requis"),
  address: optionalTrimmedString,
  phone: optionalTrimmedString,
  email: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? null : v),
    z.string().trim().email("Adresse e-mail invalide").nullable().optional()
  ),
  defaultTaxRate: z.coerce.number().min(0).max(100).default(0),
});

export async function updateClinicSettingsAction(formValues: unknown): Promise<ActionResult<null>> {
  await requireStaff();
  const parsed = clinicSettingsSchema.safeParse(formValues);
  if (!parsed.success) {
    return { ok: false, error: "Vérifiez les champs.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  await invoicesData.updateClinicSettings(parsed.data);
  revalidatePath("/settings");
  return { ok: true, data: null };
}
