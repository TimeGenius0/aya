import { requireStaff } from "@/lib/auth";
import { getOAuthClient } from "@/lib/oauth/clients";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PawIcon } from "@/components/layout/icons";

export default async function AuthorizePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const { staff } = await requireStaff();

  const clientId = params.client_id;
  const redirectUri = params.redirect_uri;
  const responseType = params.response_type;
  const codeChallenge = params.code_challenge;
  const codeChallengeMethod = params.code_challenge_method ?? "S256";
  const state = params.state ?? "";

  if (!clientId || !redirectUri || !codeChallenge) {
    return <ErrorScreen message="Requête d'autorisation incomplète (paramètres manquants)." />;
  }
  if (responseType !== "code") {
    return <ErrorScreen message="Ce serveur ne prend en charge que le flux « code »." />;
  }

  const client = await getOAuthClient(clientId);
  if (!client) {
    return <ErrorScreen message="Application inconnue — inscription requise avant de demander une autorisation." />;
  }
  if (!client.redirectUris.includes(redirectUri)) {
    return <ErrorScreen message="Cette adresse de redirection ne correspond à aucune adresse enregistrée pour cette application." />;
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardBody className="space-y-5 text-center">
          <PawIcon className="mx-auto text-brand" width={32} height={32} />
          <div>
            <h1 className="text-lg font-semibold">Autoriser l&apos;accès ?</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              <strong className="text-foreground">{client.clientName || "Une application"}</strong> demande
              à accéder aux dossiers du cabinet (clients, animaux, notes, consultations, factures) en tant
              que <strong className="text-foreground">{staff.fullName}</strong>.
            </p>
          </div>

          <form action="/oauth/authorize/approve" method="POST" className="space-y-2">
            <input type="hidden" name="client_id" value={clientId} />
            <input type="hidden" name="redirect_uri" value={redirectUri} />
            <input type="hidden" name="code_challenge" value={codeChallenge} />
            <input type="hidden" name="code_challenge_method" value={codeChallengeMethod} />
            <input type="hidden" name="state" value={state} />
            <Button type="submit" name="decision" value="approve" className="w-full">
              Autoriser
            </Button>
            <Button type="submit" name="decision" value="deny" variant="secondary" className="w-full">
              Refuser
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardBody className="space-y-2 text-center">
          <h1 className="text-lg font-semibold">Autorisation impossible</h1>
          <p className="text-sm text-muted-foreground">{message}</p>
        </CardBody>
      </Card>
    </div>
  );
}
