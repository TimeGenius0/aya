"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createNoteSchema, NOTE_LINE_ITEM_KINDS, NOTE_LINE_ITEM_KIND_LABELS, type CreateNoteInput } from "@/lib/schemas/note";
import { createNoteAction } from "@/lib/actions/notes";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/Field";
import { PlusIcon } from "@/components/layout/icons";
import { formatCurrency, formatDateTime } from "@/lib/utils";

type ConsultationOption = { id: string; scheduledAt: string; reason: string | null };

export function NoteForm({
  animalId,
  consultations,
}: {
  animalId: string;
  consultations: ConsultationOption[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<CreateNoteInput>({
    resolver: zodResolver(createNoteSchema),
    defaultValues: {
      animalId,
      consultationId: null,
      freeText: "",
      lineItems: [],
    },
  });

  const lineItems = useFieldArray({ control: form.control, name: "lineItems" });
  const watchedItems = form.watch("lineItems");
  const total = watchedItems.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0
  );

  async function onSubmit(values: CreateNoteInput) {
    setServerError(null);
    const result = await createNoteAction(values);
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    router.push(`/notes/${result.data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{serverError}</p>
      )}

      {consultations.length > 0 && (
        <FormField label="Consultation liée (optionnel)" htmlFor="consultationId">
          <Select id="consultationId" {...form.register("consultationId")}>
            <option value="">Aucune</option>
            {consultations.map((c) => (
              <option key={c.id} value={c.id}>
                {formatDateTime(c.scheduledAt)} {c.reason ? `— ${c.reason}` : ""}
              </option>
            ))}
          </Select>
        </FormField>
      )}

      <FormField label="Compte-rendu" htmlFor="freeText" error={form.formState.errors.freeText?.message}>
        <Textarea
          id="freeText"
          placeholder="Observations, diagnostic, traitement administré…"
          {...form.register("freeText")}
        />
      </FormField>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-sm font-medium">Traitements et produits</span>
          <button
            type="button"
            onClick={() => lineItems.append({ kind: "traitement", description: "", quantity: 1, unitPrice: 0 })}
            className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
          >
            <PlusIcon width={14} height={14} />
            Ajouter une ligne
          </button>
        </div>
        <p className="mb-2 text-xs text-muted-foreground">
          Ces lignes serviront de base à la facture générée depuis cette note.
        </p>

        {lineItems.fields.length > 0 && (
          <div className="space-y-2">
            {lineItems.fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 items-start gap-2">
                <div className="col-span-3">
                  <Select {...form.register(`lineItems.${index}.kind`)}>
                    {NOTE_LINE_ITEM_KINDS.map((kind) => (
                      <option key={kind} value={kind}>
                        {NOTE_LINE_ITEM_KIND_LABELS[kind]}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="col-span-4">
                  <Input placeholder="Description" {...form.register(`lineItems.${index}.description`)} />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Qté"
                    {...form.register(`lineItems.${index}.quantity`)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="Prix"
                    {...form.register(`lineItems.${index}.unitPrice`)}
                  />
                </div>
                <div className="col-span-1 pt-2 text-right">
                  <button
                    type="button"
                    onClick={() => lineItems.remove(index)}
                    className="text-xs text-muted-foreground hover:text-danger"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {lineItems.fields.length > 0 && (
          <div className="mt-3 flex justify-end border-t border-border pt-3">
            <span className="text-sm font-medium">Total : {formatCurrency(total)}</span>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Enregistrement…" : "Enregistrer la note"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
