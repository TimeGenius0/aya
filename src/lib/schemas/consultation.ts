import { z } from "zod";
import { optionalTrimmedString } from "./common";

export const CONSULTATION_STATUSES = [
  "planifie",
  "confirme",
  "termine",
  "annule",
  "absent",
] as const;

export const CONSULTATION_STATUS_LABELS: Record<
  (typeof CONSULTATION_STATUSES)[number],
  string
> = {
  planifie: "Planifiée",
  confirme: "Confirmée",
  termine: "Terminée",
  annule: "Annulée",
  absent: "Absence",
};

export const consultationFieldsSchema = z.object({
  clientId: z.string().uuid(),
  animalId: z.string().uuid(),
  scheduledAt: z.string().min(1, "La date et l'heure sont requises"), // ISO datetime
  durationMinutes: z.coerce.number().int().positive().default(30),
  reason: optionalTrimmedString,
  status: z.enum(CONSULTATION_STATUSES).default("planifie"),
});

export const createConsultationSchema = consultationFieldsSchema;
export type CreateConsultationInput = z.infer<typeof createConsultationSchema>;

export const updateConsultationSchema = consultationFieldsSchema.partial().extend({
  consultationId: z.string().uuid(),
});
export type UpdateConsultationInput = z.infer<typeof updateConsultationSchema>;

export const calendarRangeSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
});
