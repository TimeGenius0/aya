"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClientSchema, type CreateClientInput } from "@/lib/schemas/client";
import { createClientAction, updateClientAction } from "@/lib/actions/clients";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Field";

type Props =
  | { mode: "create" }
  | {
      mode: "edit";
      clientId: string;
      defaultValues: CreateClientInput;
    };

export function ClientForm(props: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<CreateClientInput>({
    resolver: zodResolver(createClientSchema),
    defaultValues:
      props.mode === "edit"
        ? props.defaultValues
        : { fullName: "", phone: null, email: null, address: null, notes: null },
  });

  async function onSubmit(values: CreateClientInput) {
    setServerError(null);
    const result =
      props.mode === "create"
        ? await createClientAction(values)
        : await updateClientAction({ ...values, clientId: props.clientId });

    if (!result.ok) {
      setServerError(result.error);
      for (const [field, message] of Object.entries(result.fieldErrors ?? {})) {
        form.setError(field as keyof CreateClientInput, { message });
      }
      return;
    }

    router.push(`/clients/${result.data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{serverError}</p>
      )}

      <FormField label="Nom complet" htmlFor="fullName" error={form.formState.errors.fullName?.message}>
        <Input id="fullName" {...form.register("fullName")} />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Téléphone" htmlFor="phone" error={form.formState.errors.phone?.message}>
          <Input id="phone" type="tel" {...form.register("phone")} />
        </FormField>
        <FormField label="E-mail" htmlFor="email" error={form.formState.errors.email?.message}>
          <Input id="email" type="email" {...form.register("email")} />
        </FormField>
      </div>

      <FormField label="Adresse" htmlFor="address" error={form.formState.errors.address?.message}>
        <Input id="address" {...form.register("address")} />
      </FormField>

      <FormField label="Notes" htmlFor="notes" error={form.formState.errors.notes?.message}>
        <Textarea id="notes" placeholder="Informations utiles sur ce client…" {...form.register("notes")} />
      </FormField>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? "Enregistrement…"
            : props.mode === "create"
              ? "Créer le client"
              : "Enregistrer"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
