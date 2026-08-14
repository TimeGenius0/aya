import { NextResponse } from "next/server";

// RFC 8414 — lets an MCP client (claude.ai's "Add custom connector") discover
// our OAuth endpoints automatically instead of anyone typing URLs in by hand.
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  return NextResponse.json({
    issuer: origin,
    authorization_endpoint: `${origin}/oauth/authorize`,
    token_endpoint: `${origin}/oauth/token`,
    registration_endpoint: `${origin}/oauth/register`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none"],
    scopes_supported: ["mcp"],
  });
}
