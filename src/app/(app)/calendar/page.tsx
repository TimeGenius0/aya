import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { CalendarView } from "@/components/calendar/CalendarView";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ animalId?: string }>;
}) {
  const { animalId } = await searchParams;

  const clients = await prisma.client.findMany({
    orderBy: { fullName: "asc" },
    select: { id: true, fullName: true, animals: { select: { id: true, name: true }, orderBy: { name: "asc" } } },
  });

  return (
    <div>
      <PageHeader title="Calendrier" subtitle="Consultations planifiées" />
      <CalendarView clients={clients} initialAnimalId={animalId} />
    </div>
  );
}
