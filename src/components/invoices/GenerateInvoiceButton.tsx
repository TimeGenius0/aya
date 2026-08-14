"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateInvoiceAction } from "@/lib/actions/invoices";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

export function GenerateInvoiceButton({
  noteId,
  defaultTaxRate = 0,
}: {
  noteId: string;
  defaultTaxRate?: number;
}) {
  const router = useRouter();
  const [taxRate, setTaxRate] = useState(defaultTaxRate);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);
    const result = await generateInvoiceAction({ noteId, taxRate });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(`/invoices/${result.data.id}`);
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex items-center gap-2">
        <label htmlFor="taxRate" className="text-sm text-muted-foreground">
          TVA (%)
        </label>
        <Input
          id="taxRate"
          type="number"
          min="0"
          max="100"
          step="0.5"
          value={taxRate}
          onChange={(e) => setTaxRate(Number(e.target.value))}
          className="w-20"
        />
        <Button onClick={handleClick} disabled={pending}>
          {pending ? "Génération…" : "Générer la facture"}
        </Button>
      </div>
    </div>
  );
}
