import { z } from "zod";
import { optionalTrimmedString } from "./common";

export const clientFieldsSchema = z.object({
  fullName: z.string().trim().min(1, "Le nom est requis"),
  phone: optionalTrimmedString,
  email: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? null : v),
    z.string().trim().email("Adresse e-mail invalide").nullable().optional()
  ),
  address: optionalTrimmedString,
  notes: optionalTrimmedString,
});

export const createClientSchema = clientFieldsSchema;
export type CreateClientInput = z.infer<typeof createClientSchema>;

export const updateClientSchema = clientFieldsSchema.partial().extend({
  clientId: z.string().uuid(),
});
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
