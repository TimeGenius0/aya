"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

const passwordSchema = z.object({
  email: z.string().trim().email("Adresse e-mail invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});
type PasswordValues = z.infer<typeof passwordSchema>;

const magicLinkSchema = z.object({
  email: z.string().trim().email("Adresse e-mail invalide"),
});
type MagicLinkValues = z.infer<typeof magicLinkSchema>;

export function LoginForm() {
  const [mode, setMode] = useState<"password" | "magic-link">("password");
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams?.get("next") || "/dashboard";

  const passwordForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });
  const magicLinkForm = useForm<MagicLinkValues>({ resolver: zodResolver(magicLinkSchema) });

  async function onPasswordSubmit(values: PasswordValues) {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) {
      setServerError("E-mail ou mot de passe incorrect.");
      return;
    }
    router.push(next);
    router.refresh();
  }

  async function onMagicLinkSubmit(values: MagicLinkValues) {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: values.email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      setServerError("Impossible d'envoyer le lien. Vérifiez l'adresse e-mail.");
      return;
    }
    router.push(`/login/magic-link-sent?email=${encodeURIComponent(values.email)}`);
  }

  return (
    <div>
      <div className="mb-6 flex rounded-lg border border-border bg-surface-muted p-1">
        <TabButton active={mode === "password"} onClick={() => setMode("password")}>
          Mot de passe
        </TabButton>
        <TabButton active={mode === "magic-link"} onClick={() => setMode("magic-link")}>
          Lien magique
        </TabButton>
      </div>

      {serverError && (
        <p className="mb-4 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{serverError}</p>
      )}

      {mode === "password" ? (
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          <FormField
            label="Adresse e-mail"
            htmlFor="email"
            error={passwordForm.formState.errors.email?.message}
          >
            <Input id="email" type="email" autoComplete="email" {...passwordForm.register("email")} />
          </FormField>
          <FormField
            label="Mot de passe"
            htmlFor="password"
            error={passwordForm.formState.errors.password?.message}
          >
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...passwordForm.register("password")}
            />
          </FormField>
          <Button type="submit" className="w-full" disabled={passwordForm.formState.isSubmitting}>
            {passwordForm.formState.isSubmitting ? "Connexion…" : "Se connecter"}
          </Button>
        </form>
      ) : (
        <form onSubmit={magicLinkForm.handleSubmit(onMagicLinkSubmit)} className="space-y-4">
          <FormField
            label="Adresse e-mail"
            htmlFor="magic-email"
            error={magicLinkForm.formState.errors.email?.message}
            hint="Un lien de connexion sera envoyé à cette adresse."
          >
            <Input
              id="magic-email"
              type="email"
              autoComplete="email"
              {...magicLinkForm.register("email")}
            />
          </FormField>
          <Button type="submit" className="w-full" disabled={magicLinkForm.formState.isSubmitting}>
            {magicLinkForm.formState.isSubmitting ? "Envoi…" : "Envoyer un lien magique"}
          </Button>
        </form>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active ? "bg-surface shadow-sm" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
