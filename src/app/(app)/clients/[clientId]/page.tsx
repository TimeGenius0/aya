import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient } from "@/lib/data/clients";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button, ButtonLink } from "@/components/ui/Button";
import { PlusIcon } from "@/components/layout/icons";
import { formatDate } from "@/lib/utils";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const client = await getClient(clientId);
  if (!client) notFound();

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={client.fullName}
        subtitle={`Client depuis le ${formatDate(client.createdAt)}`}
        action={
          <ButtonLink href={`/clients/${client.id}/edit`} variant="secondary" size="sm">
            Modifier
          </ButtonLink>
        }
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2 text-sm">
            <InfoRow label="Téléphone" value={client.phone} />
            <InfoRow label="E-mail" value={client.email} />
            <InfoRow label="Adresse" value={client.address} />
            {client.notes && (
              <div className="pt-2">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Notes
                </p>
                <p className="whitespace-pre-wrap text-foreground">{client.notes}</p>
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Animaux ({client.animals.length})</CardTitle>
            <Link href={`/clients/${client.id}/animals/new`}>
              <Button size="sm" variant="secondary">
                <PlusIcon width={16} height={16} />
                Ajouter un animal
              </Button>
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            {client.animals.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                Aucun animal enregistré pour ce client.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {client.animals.map((animal) => (
                  <Link
                    key={animal.id}
                    href={`/animals/${animal.id}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-surface-muted"
                  >
                    <div>
                      <p className="font-medium">{animal.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {[animal.species, animal.breed].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value || "—"}</span>
    </div>
  );
}
