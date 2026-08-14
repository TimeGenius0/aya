"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { createClientSchema, updateClientSchema } from "@/lib/schemas/client";
import * as clientsData from "@/lib/data/clients";
import { type ActionResult, fieldErrorsFrom } from "./shared";

export async function createClientAction(formValues: unknown): Promise<ActionResult<{ id: string }>> {
  const { staff } = await requireStaff();
  const parsed = createClientSchema.safeParse(formValues);
  if (!parsed.success) {
    return { ok: false, error: "Vérifiez les champs du formulaire.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const client = await clientsData.createClient(parsed.data, staff.id);
  revalidatePath("/clients");
  return { ok: true, data: { id: client.id } };
}

export async function updateClientAction(formValues: unknown): Promise<ActionResult<{ id: string }>> {
  await requireStaff();
  const parsed = updateClientSchema.safeParse(formValues);
  if (!parsed.success) {
    return { ok: false, error: "Vérifiez les champs du formulaire.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const client = await clientsData.updateClient(parsed.data);
  revalidatePath("/clients");
  revalidatePath(`/clients/${client.id}`);
  return { ok: true, data: { id: client.id } };
}
