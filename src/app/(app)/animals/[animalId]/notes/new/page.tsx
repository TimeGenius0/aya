import { notFound } from "next/navigation";
import { getAnimal } from "@/lib/data/animals";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { NoteForm } from "@/components/notes/NoteForm";

export default async function NewNotePage({
  params,
}: {
  params: Promise<{ animalId: string }>;
}) {
  const { animalId } = await params;
  const animal = await getAnimal(animalId);
  if (!animal) notFound();

  return (
    <div className="max-w-2xl">
      <PageHeader title="Nouvelle note" subtitle={`${animal.name} — ${animal.client.fullName}`} />
      <Card>
        <CardBody>
          <NoteForm
            animalId={animal.id}
            consultations={animal.consultations.map((c) => ({
              id: c.id,
              scheduledAt: c.scheduledAt.toISOString(),
              reason: c.reason,
            }))}
          />
        </CardBody>
      </Card>
    </div>
  );
}
