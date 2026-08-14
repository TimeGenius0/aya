import { createHash } from "node:crypto";

/**
 * Verifies a PKCE code_verifier against the code_challenge stored at
 * /oauth/authorize time (RFC 7636). Only S256 is supported — every real
 * OAuth client (claude.ai included) uses it; "plain" exists in the spec
 * only for constrained devices that can't compute SHA-256.
 */
export function verifyPkce(codeVerifier: string, codeChallenge: string, method: string) {
  if (method !== "S256") return false;
  const computed = createHash("sha256").update(codeVerifier).digest("base64url");
  return computed === codeChallenge;
}
