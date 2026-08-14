import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth";
import { getOAuthClient } from "@/lib/oauth/clients";
import { createAuthorizationCode } from "@/lib/oauth/codes";

// Handles the consent form submit from /oauth/authorize. Re-validates
// everything server-side rather than trusting the posted hidden fields —
// the browser is not a trusted party in this exchange.
export async function POST(request: Request) {
  const { staff } = await requireStaff();
  const form = await request.formData();

  const clientId = form.get("client_id")?.toString();
  const redirectUri = form.get("redirect_uri")?.toString();
  const codeChallenge = form.get("code_challenge")?.toString();
  const codeChallengeMethod = form.get("code_challenge_method")?.toString() || "S256";
  const state = form.get("state")?.toString() ?? "";
  const decision = form.get("decision")?.toString();

  if (!clientId || !redirectUri || !codeChallenge) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const client = await getOAuthClient(clientId);
  if (!client || !client.redirectUris.includes(redirectUri)) {
    // Don't redirect anywhere we haven't verified — that's the whole point
    // of checking redirect_uri membership before ever using it as a target.
    return NextResponse.json({ error: "invalid_client_or_redirect_uri" }, { status: 400 });
  }

  const redirectTarget = new URL(redirectUri);

  if (decision !== "approve") {
    redirectTarget.searchParams.set("error", "access_denied");
    if (state) redirectTarget.searchParams.set("state", state);
    return NextResponse.redirect(redirectTarget);
  }

  const code = await createAuthorizationCode({
    clientId,
    redirectUri,
    codeChallenge,
    codeChallengeMethod,
    staffId: staff.id,
  });

  redirectTarget.searchParams.set("code", code);
  if (state) redirectTarget.searchParams.set("state", state);
  return NextResponse.redirect(redirectTarget);
}
