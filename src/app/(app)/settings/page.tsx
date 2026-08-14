import { getClinicSettings } from "@/lib/data/invoices";
import { listApiKeys } from "@/lib/mcp/apiKeyAuth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { ClinicSettingsForm } from "@/components/settings/ClinicSettingsForm";
import { ApiKeysSection, type ApiKeyRow } from "@/components/settings/ApiKeysSection";

export default async function SettingsPage() {
  const [clinic, apiKeys] = await Promise.all([getClinicSettings(), listApiKeys()]);

  return (
    <div className="max-w-xl space-y-5">
      <PageHeader title="Réglages" />

      <Card>
        <CardHeader>
          <CardTitle>Informations du cabinet</CardTitle>
        </CardHeader>
        <CardBody>
          <ClinicSettingsForm
            defaultValues={{
              name: clinic.name,
              address: clinic.address ?? "",
              phone: clinic.phone ?? "",
              email: clinic.email ?? "",
              defaultTaxRate: Number(clinic.defaultTaxRate),
            }}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clés MCP</CardTitle>
        </CardHeader>
        <CardBody>
          <ApiKeysSection keys={apiKeys as ApiKeyRow[]} />
        </CardBody>
      </Card>
    </div>
  );
}
