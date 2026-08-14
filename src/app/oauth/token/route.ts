import { NextResponse } from "next/server";
import { getOAuthClient } from "@/lib/oauth/clients";
import { consumeAuthorizationCode } from "@/lib/oauth/codes";
import { verifyPkce } from "@/lib/oauth/pkce";
import { createApiKey } from "@/lib/mcp/apiKeyAuth";

// Called directly by the client's backend (claude.ai), never through a
// browser — no cookie session here. Trust is entirely: a valid, unused,
// unexpired code + a PKCE verifier that hashes to the challenge it was
// issued with. Public clients only (no client_secret to check — that's the
// point of PKCE).
export async function POST(request: Request) {
  const form = await request.formData();

  const grantType = form.get("grant_type")?.toString();
  if (grantType !== "authorization_code") {
    return NextResponse.json({ error: "unsupported_grant_type" }, { status: 400 });
  }

  const code = form.get("code")?.toString();
  const redirectUri = form.get("redirect_uri")?.toString();
  const clientId = form.get("client_id")?.toString();
  const codeVerifier = form.get("code_verifier")?.toString();

  if (!code || !redirectUri || !clientId || !codeVerifier) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const record = await consumeAuthorizationCode(code);
  if (!record) {
    return NextResponse.json({ error: "invalid_grant" }, { status: 400 });
  }
  if (record.clientId !== clientId || record.redirectUri !== redirectUri) {
    return NextResponse.json({ error: "invalid_grant" }, { status: 400 });
  }
  if (!verifyPkce(codeVerifier, record.codeChallenge, record.codeChallengeMethod)) {
    return NextResponse.json({ error: "invalid_grant" }, { status: 400 });
  }

  const client = await getOAuthClient(clientId);
  const { raw } = await createApiKey(`OAuth: ${client?.clientName || clientId}`, record.staffId);

  return NextResponse.json({
    access_token: raw,
    token_type: "Bearer",
    // Not enforced server-side (api_keys don't expire, only get revoked) —
    // this is a large but finite value so clients that require expires_in
    // don't choke on a missing field. A refresh just re-runs the full
    // authorize flow, which works fine again since the underlying key
    // never actually expires.
    expires_in: 31536000,
    scope: "mcp",
  });
}
