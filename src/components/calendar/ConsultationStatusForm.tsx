"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateConsultationAction } from "@/lib/actions/consultations";
import { CONSULTATION_STATUSES, CONSULTATION_STATUS_LABELS } from "@/lib/schemas/consultation";
import { Select } from "@/components/ui/Field";

export function ConsultationStatusForm({
  consultationId,
  status,
}: {
  consultationId: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setPending(true);
    await updateConsultationAction({ consultationId, status: e.target.value });
    setPending(false);
    router.refresh();
  }

  return (
    <Select defaultValue={status} disabled={pending} onChange={onChange} className="w-auto">
      {CONSULTATION_STATUSES.map((s) => (
        <option key={s} value={s}>
          {CONSULTATION_STATUS_LABELS[s]}
        </option>
      ))}
    </Select>
  );
}
