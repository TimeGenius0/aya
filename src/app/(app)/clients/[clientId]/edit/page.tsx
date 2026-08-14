import { notFound } from "next/navigation";
import { getClient } from "@/lib/data/clients";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { ClientForm } from "@/components/clients/ClientForm";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const client = await getClient(clientId);
  if (!client) notFound();

  return (
    <div className="max-w-xl">
      <PageHeader title={`Modifier ${client.fullName}`} />
      <Card>
        <CardBody>
          <ClientForm
            mode="edit"
            clientId={client.id}
            defaultValues={{
              fullName: client.fullName,
              phone: client.phone,
              email: client.email,
              address: client.address,
              notes: client.notes,
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
