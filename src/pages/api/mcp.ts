import type { NextApiRequest, NextApiResponse } from "next";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { verifyApiKey } from "@/lib/mcp/apiKeyAuth";
import { registerTools } from "@/lib/mcp/tools";

// Pages Router API routes (unlike App Router route handlers) get Node's raw
// req/res objects, which is what the MCP SDK's StreamableHTTPServerTransport
// is built for — that compatibility is the reason this endpoint lives under
// src/pages/api instead of src/app/api. middleware.ts already bypasses
// /api/mcp for the cookie-session check; auth here is the bearer API key.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = await verifyApiKey(req.headers.authorization);
  if (!auth) {
    res.status(401).json({
      jsonrpc: "2.0",
      error: { code: -32001, message: "Clé API manquante, invalide ou révoquée." },
      id: null,
    });
    return;
  }

  // Stateless mode: a fresh server + transport per request, no session id —
  // the right shape for a serverless function with no shared memory between
  // invocations.
  const server = new McpServer({ name: "aya-handous", version: "1.0.0" });
  registerTools(server, { staffId: auth.staffId });

  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

  res.on("close", () => {
    transport.close();
    server.close();
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
}
