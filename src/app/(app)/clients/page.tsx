import Link from "next/link";
import { listClients } from "@/lib/data/clients";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Card } from "@/components/ui/Card";
import { PlusIcon, ClientsIcon } from "@/components/layout/icons";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const { clients, total } = await listClients({ search: q, limit: 100 });

  return (
    <div>
      <PageHeader
        title="Clients"
        subtitle={`${total} client${total > 1 ? "s" : ""}`}
        action={
          <ButtonLink href="/clients/new">
            <PlusIcon />
            Nouveau client
          </ButtonLink>
        }
      />

      <form method="get" className="mb-5">
        <Input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Rechercher par nom, téléphone ou e-mail…"
          className="max-w-md"
        />
      </form>

      {clients.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <ClientsIcon className="text-muted-foreground" width={28} height={28} />
          <p className="text-sm text-muted-foreground">
            {q ? "Aucun client ne correspond à cette recherche." : "Aucun client pour l'instant."}
          </p>
          {!q && (
            <ButtonLink href="/clients/new" size="sm">
              Ajouter le premier client
            </ButtonLink>
          )}
        </Card>
      ) : (
        <Card className="divide-y divide-border overflow-hidden">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-surface-muted"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{client.fullName}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {[client.phone, client.email].filter(Boolean).join(" · ") || "Aucun contact renseigné"}
                </p>
              </div>
              <span className="shrink-0 text-sm text-muted-foreground">
                {client._count.animals} animal{client._count.animals > 1 ? "ux" : ""}
              </span>
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
