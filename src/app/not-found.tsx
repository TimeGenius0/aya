"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { consumeImplicitTokensFromLocation } from "@/lib/supabase/consumeImplicitTokens";

// Also handles stray Supabase auth tokens that ended up on an unmatched
// path (e.g. a redirect_to whose "#" got stripped by an email link-scanner)
// — see consumeImplicitTokens.ts. A visitor should never see a dead end
// just because a link got mangled in transit.
export default function NotFound() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    consumeImplicitTokensFromLocation().then((found) => {
      if (found) {
        router.replace("/dashboard");
      } else {
        setChecked(true);
      }
    });
  }, [router]);

  if (!checked) return null;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background px-4 text-center">
      <h1 className="text-xl font-semibold">Page introuvable</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Cette page n&apos;existe pas ou plus.
      </p>
      <Link href="/dashboard" className="text-sm text-brand hover:underline">
        Retour au tableau de bord
      </Link>
    </div>
  );
}
