import { NextResponse } from "next/server";

// RFC 9728 — tells a client which authorization server protects /api/mcp.
// Our authorization server happens to live on the same origin.
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  return NextResponse.json({
    resource: `${origin}/api/mcp`,
    authorization_servers: [origin],
  });
}
