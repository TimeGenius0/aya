import { z } from "zod";
import { optionalTrimmedString } from "./common";

export const ANIMAL_SEXES = ["M", "F", "inconnu"] as const;

/** Common species shown as quick-pick suggestions; the field itself is free text. */
export const COMMON_SPECIES = [
  "Chien",
  "Chat",
  "Oiseau",
  "Lapin",
  "Rongeur",
  "Reptile",
  "Cheval",
  "Autre",
] as const;

const nullableNumber = z.preprocess(
  (v) => (v === "" || v === undefined ? null : v),
  z.coerce.number().nonnegative().nullable().optional()
);

export const animalFieldsSchema = z.object({
  name: z.string().trim().min(1, "Le nom de l'animal est requis"),
  species: z.string().trim().min(1, "L'espèce est requise"),
  breed: optionalTrimmedString,
  sex: z.enum(ANIMAL_SEXES).nullable().optional(),
  birthdate: optionalTrimmedString, // ISO date string, e.g. "2021-06-01"
  approxAgeYears: nullableNumber,
  weightKg: nullableNumber,
  notes: optionalTrimmedString,
  /** Flexible per-species extra fields, e.g. { "plumage": "gris" } for a bird. */
  attributes: z.record(z.string(), z.string()).default({}),
});

export const createAnimalSchema = animalFieldsSchema.extend({
  clientId: z.string().uuid(),
});
export type CreateAnimalInput = z.infer<typeof createAnimalSchema>;

export const updateAnimalSchema = animalFieldsSchema.partial().extend({
  animalId: z.string().uuid(),
});
export type UpdateAnimalInput = z.infer<typeof updateAnimalSchema>;
