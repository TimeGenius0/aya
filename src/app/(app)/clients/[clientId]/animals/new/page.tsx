import { notFound } from "next/navigation";
import { getClient } from "@/lib/data/clients";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { AnimalForm } from "@/components/animals/AnimalForm";

export default async function NewAnimalPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const client = await getClient(clientId);
  if (!client) notFound();

  return (
    <div className="max-w-xl">
      <PageHeader title="Nouvel animal" subtitle={`Client : ${client.fullName}`} />
      <Card>
        <CardBody>
          <AnimalForm mode="create" clientId={client.id} />
        </CardBody>
      </Card>
    </div>
  );
}
