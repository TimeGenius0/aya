"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { consumeImplicitTokensFromLocation } from "@/lib/supabase/consumeImplicitTokens";

/**
 * Landing point for two very different situations:
 *  1. The common case — just send the visitor to /dashboard; middleware
 *     bounces them to /login if they have no session.
 *  2. Supabase occasionally redirects here with auth tokens attached
 *     (implicit flow — some dashboard-triggered recovery/invite links use
 *     this, unlike the app's own magic-link flow which goes through
 *     /auth/callback's ?code= form). See consumeImplicitTokens.ts for why
 *     this needs to run client-side rather than in proxy.ts.
 */
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    consumeImplicitTokensFromLocation().finally(() => {
      window.history.replaceState(null, "", "/");
      router.replace("/dashboard");
    });
  }, [router]);

  return null;
}
