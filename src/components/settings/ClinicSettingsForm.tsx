"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { updateClinicSettingsAction } from "@/lib/actions/settings";
import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Field";

type FormValues = {
  name: string;
  address: string;
  phone: string;
  email: string;
  defaultTaxRate: number;
};

export function ClinicSettingsForm({ defaultValues }: { defaultValues: FormValues }) {
  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<FormValues>({ defaultValues });

  async function onSubmit(values: FormValues) {
    setSaved(false);
    setServerError(null);
    const result = await updateClinicSettingsAction(values);
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    setSaved(true);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{serverError}</p>
      )}
      {saved && (
        <p className="rounded-md bg-brand/10 px-3 py-2 text-sm text-brand">Réglages enregistrés.</p>
      )}

      <FormField label="Nom du cabinet" htmlFor="name">
        <Input id="name" {...form.register("name")} />
      </FormField>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Téléphone" htmlFor="phone">
          <Input id="phone" {...form.register("phone")} />
        </FormField>
        <FormField label="E-mail" htmlFor="email">
          <Input id="email" type="email" {...form.register("email")} />
        </FormField>
      </div>
      <FormField label="Adresse" htmlFor="address">
        <Input id="address" {...form.register("address")} />
      </FormField>
      <FormField
        label="TVA par défaut (%)"
        htmlFor="defaultTaxRate"
        hint="Appliquée par défaut lors de la génération d'une facture"
      >
        <Input id="defaultTaxRate" type="number" min="0" max="100" step="0.5" {...form.register("defaultTaxRate")} />
      </FormField>

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
