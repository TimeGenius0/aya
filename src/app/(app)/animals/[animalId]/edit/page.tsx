import { notFound } from "next/navigation";
import { getAnimal } from "@/lib/data/animals";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { AnimalForm } from "@/components/animals/AnimalForm";

export default async function EditAnimalPage({
  params,
}: {
  params: Promise<{ animalId: string }>;
}) {
  const { animalId } = await params;
  const animal = await getAnimal(animalId);
  if (!animal) notFound();

  return (
    <div className="max-w-xl">
      <PageHeader title={`Modifier ${animal.name}`} />
      <Card>
        <CardBody>
          <AnimalForm
            mode="edit"
            animalId={animal.id}
            defaultValues={{
              name: animal.name,
              species: animal.species,
              breed: animal.breed,
              sex: animal.sex as "M" | "F" | "inconnu" | null,
              birthdate: animal.birthdate ? animal.birthdate.toISOString().slice(0, 10) : null,
              approxAgeYears: animal.approxAgeYears ? Number(animal.approxAgeYears) : null,
              weightKg: animal.weightKg ? Number(animal.weightKg) : null,
              notes: animal.notes,
              attributes: (animal.attributes ?? {}) as Record<string, string>,
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
