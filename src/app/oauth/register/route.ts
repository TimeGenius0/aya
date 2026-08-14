import { NextResponse } from "next/server";
import { z } from "zod";
import { registerOAuthClient } from "@/lib/oauth/clients";

// RFC 7591 — Dynamic Client Registration. This is what lets claude.ai obtain
// a client_id on its own the first time it connects, instead of anyone
// hand-entering an "OAuth Client ID" in a settings screen. We only ever
// register public clients (PKCE, no secret) — token_endpoint_auth_method is
// always echoed back as "none" regardless of what's requested.
const schema = z.object({
  redirect_uris: z.array(z.string().url()).min(1),
  client_name: z.string().trim().min(1).optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_client_metadata" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_client_metadata" }, { status: 400 });
  }

  const client = await registerOAuthClient({
    clientName: parsed.data.client_name,
    redirectUris: parsed.data.redirect_uris,
  });

  return NextResponse.json(
    {
      client_id: client.clientId,
      client_id_issued_at: Math.floor(client.createdAt.getTime() / 1000),
      redirect_uris: client.redirectUris,
      client_name: client.clientName ?? undefined,
      token_endpoint_auth_method: "none",
      grant_types: ["authorization_code"],
      response_types: ["code"],
    },
    { status: 201 }
  );
}
