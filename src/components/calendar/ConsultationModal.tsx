"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CONSULTATION_STATUSES,
  CONSULTATION_STATUS_LABELS,
  createConsultationSchema,
  type CreateConsultationInput,
} from "@/lib/schemas/consultation";
import { createConsultationAction, updateConsultationAction } from "@/lib/actions/consultations";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/Field";

export type ClientWithAnimals = {
  id: string;
  fullName: string;
  animals: { id: string; name: string }[];
};

export type ConsultationModalState = {
  consultationId?: string;
  scheduledAt?: string; // datetime-local formatted
  clientId?: string;
  animalId?: string;
  durationMinutes?: number;
  reason?: string;
  status?: CreateConsultationInput["status"];
};

export function ConsultationModal({
  clients,
  state,
  onClose,
  onSaved,
}: {
  clients: ClientWithAnimals[];
  state: ConsultationModalState | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const isEdit = Boolean(state?.consultationId);

  const form = useForm<CreateConsultationInput>({
    resolver: zodResolver(createConsultationSchema),
    values: {
      clientId: state?.clientId ?? "",
      animalId: state?.animalId ?? "",
      scheduledAt: state?.scheduledAt ?? "",
      durationMinutes: state?.durationMinutes ?? 30,
      reason: state?.reason ?? "",
      status: state?.status ?? "planifie",
    },
  });

  const selectedClientId = form.watch("clientId");
  const animalsForClient = useMemo(
    () => clients.find((c) => c.id === selectedClientId)?.animals ?? [],
    [clients, selectedClientId]
  );

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (state && !el.open) el.showModal();
    if (!state && el.open) el.close();
  }, [state]);

  async function onSubmit(values: CreateConsultationInput) {
    setServerError(null);
    const result = isEdit
      ? await updateConsultationAction({ ...values, consultationId: state!.consultationId })
      : await createConsultationAction(values);

    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    onSaved();
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-full max-w-md rounded-xl border border-border bg-surface p-0 text-foreground backdrop:bg-black/40"
    >
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold">{isEdit ? "Modifier la consultation" : "Nouvelle consultation"}</h2>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-5 py-4">
        {serverError && (
          <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{serverError}</p>
        )}

        <FormField label="Client" htmlFor="clientId" error={form.formState.errors.clientId?.message}>
          <Select id="clientId" {...form.register("clientId")}>
            <option value="">Sélectionner…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Animal" htmlFor="animalId" error={form.formState.errors.animalId?.message}>
          <Select id="animalId" disabled={!selectedClientId} {...form.register("animalId")}>
            <option value="">Sélectionner…</option>
            {animalsForClient.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Date et heure" htmlFor="scheduledAt" error={form.formState.errors.scheduledAt?.message}>
            <Input id="scheduledAt" type="datetime-local" {...form.register("scheduledAt")} />
          </FormField>
          <FormField label="Durée (min)" htmlFor="durationMinutes">
            <Input id="durationMinutes" type="number" step="5" min="5" {...form.register("durationMinutes")} />
          </FormField>
        </div>

        <FormField label="Motif" htmlFor="reason">
          <Textarea id="reason" placeholder="Vaccination, contrôle…" {...form.register("reason")} />
        </FormField>

        {isEdit && (
          <FormField label="Statut" htmlFor="status">
            <Select id="status" {...form.register("status")}>
              {CONSULTATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {CONSULTATION_STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </FormField>
        )}

        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Enregistrement…" : isEdit ? "Enregistrer" : "Planifier"}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
