"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateInvoiceStatusAction } from "@/lib/actions/invoices";
import { INVOICE_STATUSES, INVOICE_STATUS_LABELS } from "@/lib/schemas/invoice";
import { Select } from "@/components/ui/Field";

export function InvoiceStatusForm({ invoiceId, status }: { invoiceId: string; status: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setPending(true);
    await updateInvoiceStatusAction({ invoiceId, status: e.target.value });
    setPending(false);
    router.refresh();
  }

  return (
    <Select defaultValue={status} disabled={pending} onChange={onChange} className="w-auto">
      {INVOICE_STATUSES.map((s) => (
        <option key={s} value={s}>
          {INVOICE_STATUS_LABELS[s]}
        </option>
      ))}
    </Select>
  );
}
