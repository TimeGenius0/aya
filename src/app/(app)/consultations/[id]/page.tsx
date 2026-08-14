import Link from "next/link";
import { notFound } from "next/navigation";
import { getConsultation } from "@/lib/data/consultations";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ConsultationStatusForm } from "@/components/calendar/ConsultationStatusForm";
import { PlusIcon } from "@/components/layout/icons";
import { formatDateTime } from "@/lib/utils";

export default async function ConsultationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const consultation = await getConsultation(id);
  if (!consultation) notFound();

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={formatDateTime(consultation.scheduledAt)}
        subtitle={
          <>
            <Link href={`/animals/${consultation.animalId}`} className="hover:underline">
              {consultation.animal.name}
            </Link>{" "}
            —{" "}
            <Link href={`/clients/${consultation.clientId}`} className="hover:underline">
              {consultation.client.fullName}
            </Link>
          </>
        }
      />

      <div className="space-y-5">
        <Card>
          <CardBody className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Motif</p>
              <p className="font-medium">{consultation.reason || "—"}</p>
            </div>
            <div>
              <p className="mb-1 text-sm text-muted-foreground">Statut</p>
              <ConsultationStatusForm consultationId={consultation.id} status={consultation.status} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Notes liées</CardTitle>
            <Link href={`/animals/${consultation.animalId}/notes/new`}>
              <Button size="sm" variant="secondary">
                <PlusIcon width={16} height={16} />
                Nouvelle note
              </Button>
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            {consultation.notes.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-muted-foreground">
                Aucune note liée à cette consultation.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {consultation.notes.map((note) => (
                  <Link key={note.id} href={`/notes/${note.id}`} className="block px-5 py-3 hover:bg-surface-muted">
                    <p className="text-sm font-medium">{formatDateTime(note.createdAt)}</p>
                    {note.freeText && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{note.freeText}</p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <ButtonLink href="/calendar" variant="secondary" size="sm">
          Retour au calendrier
        </ButtonLink>
      </div>
    </div>
  );
}
