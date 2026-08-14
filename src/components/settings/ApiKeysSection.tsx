"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createApiKeyAction, revokeApiKeyAction } from "@/lib/actions/apiKeys";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { formatDateTime } from "@/lib/utils";

export type ApiKeyRow = {
  id: string;
  label: string | null;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

export function ApiKeysSection({ keys }: { keys: ApiKeyRow[] }) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const result = await createApiKeyAction({ label });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setRevealedKey(result.data.raw);
    setLabel("");
    router.refresh();
  }

  async function handleRevoke(id: string) {
    await revokeApiKeyAction(id);
    router.refresh();
  }

  const activeKeys = keys.filter((k) => !k.revoked_at);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Ces clés permettent à un assistant IA compatible MCP de lire et modifier les dossiers du
        cabinet (clients, animaux, notes, consultations, factures) via{" "}
        <code className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-xs">/api/mcp</code>.
      </p>

      {revealedKey && (
        <div className="rounded-lg border border-brand/30 bg-brand/10 px-4 py-3">
          <p className="mb-1 text-sm font-medium text-brand">
            Copiez cette clé maintenant — elle ne sera plus jamais affichée.
          </p>
          <code className="block break-all rounded bg-surface px-3 py-2 font-mono text-xs">{revealedKey}</code>
        </div>
      )}

      <form onSubmit={handleCreate} className="flex gap-2">
        <Input
          placeholder="Nom de la clé (ex. Claude Desktop)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <Button type="submit" disabled={pending || !label.trim()}>
          {pending ? "Création…" : "Créer une clé"}
        </Button>
      </form>
      {error && <p className="text-sm text-danger">{error}</p>}

      {activeKeys.length > 0 && (
        <div className="divide-y divide-border rounded-lg border border-border">
          {activeKeys.map((key) => (
            <div key={key.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <div>
                <p className="font-medium">{key.label || "Sans nom"}</p>
                <p className="text-xs text-muted-foreground">
                  Créée le {formatDateTime(key.created_at)}
                  {key.last_used_at && ` · dernière utilisation le ${formatDateTime(key.last_used_at)}`}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleRevoke(key.id)}>
                Révoquer
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
