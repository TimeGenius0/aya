import Link from "next/link";

export default async function MagicLinkSentPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <div className="text-center">
      <h1 className="text-xl font-semibold">Vérifiez votre boîte mail</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Un lien de connexion a été envoyé à{" "}
        {email ? <span className="font-medium text-foreground">{email}</span> : "votre adresse"}.
        Ouvrez-le pour accéder au tableau de bord.
      </p>
      <Link href="/login" className="mt-6 inline-block text-sm text-brand hover:underline">
        Retour à la connexion
      </Link>
    </div>
  );
}
