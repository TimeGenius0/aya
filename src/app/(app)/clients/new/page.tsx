import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { ClientForm } from "@/components/clients/ClientForm";

export default function NewClientPage() {
  return (
    <div className="max-w-xl">
      <PageHeader title="Nouveau client" />
      <Card>
        <CardBody>
          <ClientForm mode="create" />
        </CardBody>
      </Card>
    </div>
  );
}
