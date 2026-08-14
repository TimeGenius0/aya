import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listConsultations } from "@/lib/data/consultations";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { Badge, CONSULTATION_STATUS_TONE } from "@/components/ui/Badge";
import { CONSULTATION_STATUS_LABELS } from "@/lib/schemas/consultation";
import { formatDateTime } from "@/lib/utils";
import { PlusIcon, ClientsIcon, CalendarIcon } from "@/components/layout/icons";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export default async function DashboardPage() {
  const { staff } = await requireStaff();
  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [todayConsultations, upcomingConsultations, clientCount, animalCount] = await Promise.all([
    listConsultations({ from: startOfDay(now), to: endOfDay(now) }),
    listConsultations({ from: endOfDay(now), to: in7Days }),
    prisma.client.count(),
    prisma.animal.count(),
  ]);

  return (
    <div>
      <PageHeader title={`Bonjour, ${staff.fullName.split(" ")[0]}`} subtitle="Aperçu du cabinet" />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Clients" value={clientCount} />
        <StatCard label="Animaux" value={animalCount} />
        <StatCard label="Aujourd'hui" value={todayConsultations.length} />
        <StatCard label="7 prochains jours" value={upcomingConsultations.length} />
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <ButtonLink href="/clients/new" size="sm">
          <PlusIcon width={16} height={16} />
          Nouveau client
        </ButtonLink>
        <ButtonLink href="/calendar" variant="secondary" size="sm">
          <CalendarIcon width={16} height={16} />
          Ouvrir le calendrier
        </ButtonLink>
        <ButtonLink href="/clients" variant="secondary" size="sm">
          <ClientsIcon width={16} height={16} />
          Voir les clients
        </ButtonLink>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <ConsultationListCard
          title="Aujourd'hui"
          consultations={todayConsultations}
          emptyLabel="Aucune consultation aujourd'hui."
        />
        <ConsultationListCard
          title="Prochains jours"
          consultations={upcomingConsultations}
          emptyLabel="Rien de planifié dans les 7 prochains jours."
        />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardBody>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardBody>
    </Card>
  );
}

function ConsultationListCard({
  title,
  consultations,
  emptyLabel,
}: {
  title: string;
  consultations: Awaited<ReturnType<typeof listConsultations>>;
  emptyLabel: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardBody className="p-0">
        {consultations.length === 0 ? (
          <p className="px-5 py-6 text-center text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          <div className="divide-y divide-border">
            {consultations.map((c) => (
              <Link
                key={c.id}
                href={`/consultations/${c.id}`}
                className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-surface-muted"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {c.animal.name} — {c.client.fullName}
                  </p>
                  <p className="text-sm text-muted-foreground">{formatDateTime(c.scheduledAt)}</p>
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
  );
}
