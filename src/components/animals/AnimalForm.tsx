"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ANIMAL_SEXES, COMMON_SPECIES, animalFieldsSchema } from "@/lib/schemas/animal";
import { createAnimalAction, updateAnimalAction } from "@/lib/actions/animals";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/Field";
import { PlusIcon } from "@/components/layout/icons";

// Form-local shape: `attributes` edited as key/value rows, converted to a
// record on submit (that's the shape animalFieldsSchema/the DB expect).
const formSchema = animalFieldsSchema
  .omit({ attributes: true })
  .extend({
    attributeRows: z.array(z.object({ key: z.string(), value: z.string() })),
  });
type FormValues = z.infer<typeof formSchema>;

type Props =
  | { mode: "create"; clientId: string }
  | {
      mode: "edit";
      animalId: string;
      defaultValues: z.infer<typeof animalFieldsSchema>;
    };

export function AnimalForm(props: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const initialAttributes =
    props.mode === "edit" ? Object.entries(props.defaultValues.attributes ?? {}) : [];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues:
      props.mode === "edit"
        ? { ...props.defaultValues, attributeRows: initialAttributes.map(([key, value]) => ({ key, value })) }
        : {
            name: "",
            species: "",
            breed: null,
            sex: null,
            birthdate: null,
            approxAgeYears: null,
            weightKg: null,
            notes: null,
            attributeRows: [],
          },
  });

  const attributeFields = useFieldArray({ control: form.control, name: "attributeRows" });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const { attributeRows, ...rest } = values;
    const attributes = Object.fromEntries(
      attributeRows.filter((row) => row.key.trim() !== "").map((row) => [row.key.trim(), row.value])
    );
    const payload = { ...rest, attributes };

    const result =
      props.mode === "create"
        ? await createAnimalAction({ ...payload, clientId: props.clientId })
        : await updateAnimalAction({ ...payload, animalId: props.animalId });

    if (!result.ok) {
      setServerError(result.error);
      return;
    }

    router.push(`/animals/${result.data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{serverError}</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Nom de l'animal" htmlFor="name" error={form.formState.errors.name?.message}>
          <Input id="name" {...form.register("name")} />
        </FormField>
        <FormField label="Espèce" htmlFor="species" error={form.formState.errors.species?.message}>
          <Input id="species" list="species-suggestions" {...form.register("species")} />
          <datalist id="species-suggestions">
            {COMMON_SPECIES.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FormField label="Race" htmlFor="breed" error={form.formState.errors.breed?.message}>
          <Input id="breed" {...form.register("breed")} />
        </FormField>
        <FormField label="Sexe" htmlFor="sex" error={form.formState.errors.sex?.message}>
          <Select id="sex" {...form.register("sex")}>
            <option value="">—</option>
            {ANIMAL_SEXES.map((s) => (
              <option key={s} value={s}>
                {s === "M" ? "Mâle" : s === "F" ? "Femelle" : "Inconnu"}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Date de naissance" htmlFor="birthdate" error={form.formState.errors.birthdate?.message}>
          <Input id="birthdate" type="date" {...form.register("birthdate")} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="Âge approximatif (années)"
          htmlFor="approxAgeYears"
          hint="Si la date de naissance est inconnue"
          error={form.formState.errors.approxAgeYears?.message}
        >
          <Input id="approxAgeYears" type="number" step="0.5" min="0" {...form.register("approxAgeYears")} />
        </FormField>
        <FormField label="Poids (kg)" htmlFor="weightKg" error={form.formState.errors.weightKg?.message}>
          <Input id="weightKg" type="number" step="0.1" min="0" {...form.register("weightKg")} />
        </FormField>
      </div>

      <FormField label="Notes" htmlFor="notes" error={form.formState.errors.notes?.message}>
        <Textarea id="notes" placeholder="Particularités, allergies…" {...form.register("notes")} />
      </FormField>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-sm font-medium">Caractéristiques additionnelles</span>
          <button
            type="button"
            onClick={() => attributeFields.append({ key: "", value: "" })}
            className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
          >
            <PlusIcon width={14} height={14} />
            Ajouter un champ
          </button>
        </div>
        <p className="mb-2 text-xs text-muted-foreground">
          Pour ce qui ne rentre pas ailleurs — plumage, particularité d&apos;un NAC, etc.
        </p>
        <div className="space-y-2">
          {attributeFields.fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <Input placeholder="Nom" {...form.register(`attributeRows.${index}.key`)} />
              <Input placeholder="Valeur" {...form.register(`attributeRows.${index}.value`)} />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => attributeFields.remove(index)}
              >
                Retirer
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? "Enregistrement…"
            : props.mode === "create"
              ? "Ajouter l'animal"
              : "Enregistrer"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
