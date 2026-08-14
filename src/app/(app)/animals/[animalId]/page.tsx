import Link from "next/link";
import { notFound } from "next/navigation";
import { getAnimal } from "@/lib/data/animals";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Badge, CONSULTATION_STATUS_TONE } from "@/components/ui/Badge";
import { PlusIcon } from "@/components/layout/icons";
import { formatDate, formatDateTime, formatCurrency } from "@/lib/utils";
import { CONSULTATION_STATUS_LABELS } from "@/lib/schemas/consultation";
import { NOTE_LINE_ITEM_KIND_LABELS } from "@/lib/schemas/note";

export default async function AnimalDetailPage({
  params,
}: {
  params: Promise<{ animalId: string }>;
}) {
  const { animalId } = await params;
  const animal = await getAnimal(animalId);
  if (!animal) notFound();

  const attributes = (animal.attributes ?? {}) as Record<string, string>;

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={animal.name}
        subtitle={
          <Link href={`/clients/${animal.clientId}`} className="hover:underline">
            {animal.client.fullName}
          </Link>
        }
        action={
          <ButtonLink href={`/animals/${animal.id}/edit`} variant="secondary" size="sm">
            Modifier
          </ButtonLink>
        }
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profil</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2 text-sm">
            <InfoRow label="Espèce" value={animal.species} />
            <InfoRow label="Race" value={animal.breed} />
            <InfoRow label="Sexe" value={animal.sex === "M" ? "Mâle" : animal.sex === "F" ? "Femelle" : animal.sex} />
            <InfoRow
              label="Naissance"
              value={animal.birthdate ? formatDate(animal.birthdate) : animal.approxAgeYears ? `≈ ${animal.approxAgeYears} ans` : null}
            />
            <InfoRow label="Poids" value={animal.weightKg ? `${animal.weightKg} kg` : null} />
            {Object.entries(attributes).map(([key, value]) => (
              <InfoRow key={key} label={key} value={value} />
            ))}
            {animal.notes && (
              <div className="pt-2">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Notes générales
                </p>
                <p className="whitespace-pre-wrap text-foreground">{animal.notes}</p>
              </div>
            )}
          </CardBody>
        </Card>

        <div className="space-y-5 md:col-span-2">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Consultations</CardTitle>
              <ButtonLink href={`/calendar?animalId=${animal.id}`} variant="secondary" size="sm">
                <PlusIcon width={16} height={16} />
                Planifier
              </ButtonLink>
            </CardHeader>
            <CardBody className="p-0">
              {animal.consultations.length === 0 ? (
                <p className="px-5 py-6 text-center text-sm text-muted-foreground">
                  Aucune consultation enregistrée.
                </p>
              ) : (
                <div className="divide-y divide-border">
                  {animal.consultations.map((c) => (
                    <Link
                      key={c.id}
                      href={`/consultations/${c.id}`}
                      className="flex items-center justify-between px-5 py-3 hover:bg-surface-muted"
                    >
                      <div>
                        <p className="font-medium">{formatDateTime(c.scheduledAt)}</p>
                        {c.reason && <p className="text-sm text-muted-foreground">{c.reason}</p>}
                      </div>
                      <Badge tone={CONSULTATION_STATUS_TONE[c.status]}>
                        {CONSULTATION_STATUS_LABELS[c.status as keyof typeof CONSULTATION_STATUS_LABELS] ?? c.status}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Notes de traitement</CardTitle>
              <Link href={`/animals/${animal.id}/notes/new`}>
                <Button size="sm" variant="secondary">
                  <PlusIcon width={16} height={16} />
                  Nouvelle note
                </Button>
              </Link>
            </CardHeader>
            <CardBody className="p-0">
              {animal.notesEntries.length === 0 ? (
                <p className="px-5 py-6 text-center text-sm text-muted-foreground">
                  Aucune note pour l&apos;instant.
                </p>
              ) : (
                <div className="divide-y divide-border">
                  {animal.notesEntries.map((note) => (
                    <Link
                      key={note.id}
                      href={`/notes/${note.id}`}
                      className="block px-5 py-3 hover:bg-surface-muted"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{formatDateTime(note.createdAt)}</p>
                        {note.author && (
                          <span className="text-xs text-muted-foreground">{note.author.fullName}</span>
                        )}
                      </div>
                      {note.freeText && (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{note.freeText}</p>
                      )}
                      {note.lineItems.length > 0 && (
                        <ul className="mt-2 space-y-0.5 text-sm">
                          {note.lineItems.map((li) => (
                            <li key={li.id} className="flex justify-between text-muted-foreground">
                              <span>
                                {NOTE_LINE_ITEM_KIND_LABELS[li.kind as keyof typeof NOTE_LINE_ITEM_KIND_LABELS] ??
                                  li.kind}{" "}
                                — {li.description} ({li.quantity.toString()})
                              </span>
                              <span>{formatCurrency(Number(li.quantity) * Number(li.unitPrice))}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="capitalize text-muted-foreground">{label}</span>
      <span className="text-right">{value || "—"}</span>
    </div>
  );
}
