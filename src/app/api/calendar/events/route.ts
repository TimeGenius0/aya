import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listConsultations } from "@/lib/data/consultations";
import { CONSULTATION_STATUS_LABELS } from "@/lib/schemas/consultation";

// FullCalendar refetches this as the user navigates months — kept as a thin
// JSON view over the same listConsultations() the pages use.
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("start");
  const to = searchParams.get("end");

  const consultations = await listConsultations({
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
  });

  const events = consultations.map((c) => ({
    id: c.id,
    title: `${c.animal.name} — ${c.client.fullName}`,
    start: c.scheduledAt.toISOString(),
    end: new Date(c.scheduledAt.getTime() + c.durationMinutes * 60_000).toISOString(),
    extendedProps: {
      status: c.status,
      statusLabel: CONSULTATION_STATUS_LABELS[c.status as keyof typeof CONSULTATION_STATUS_LABELS],
      reason: c.reason,
      clientId: c.clientId,
      animalId: c.animalId,
    },
  }));

  return NextResponse.json(events);
}
