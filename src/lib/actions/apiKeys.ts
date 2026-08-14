"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import * as apiKeyAuth from "@/lib/mcp/apiKeyAuth";
import { type ActionResult, fieldErrorsFrom } from "./shared";

const createSchema = z.object({ label: z.string().trim().min(1, "Donnez un nom à cette clé") });

export async function createApiKeyAction(formValues: unknown): Promise<ActionResult<{ raw: string }>> {
  const { staff } = await requireStaff();
  const parsed = createSchema.safeParse(formValues);
  if (!parsed.success) {
    return { ok: false, error: "Nom requis.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const { raw } = await apiKeyAuth.createApiKey(parsed.data.label, staff.id);
  revalidatePath("/settings");
  return { ok: true, data: { raw } };
}

export async function revokeApiKeyAction(id: string): Promise<ActionResult<null>> {
  await requireStaff();
  await apiKeyAuth.revokeApiKey(id);
  revalidatePath("/settings");
  return { ok: true, data: null };
}
