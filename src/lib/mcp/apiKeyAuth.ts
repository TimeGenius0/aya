import { randomBytes, createHash } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/service";

const KEY_PREFIX = "ayh_";

function hashKey(rawKey: string) {
  return createHash("sha256").update(rawKey).digest("hex");
}

/** Generates a new raw API key + its hash. Only the raw value is ever shown, once. */
export function generateApiKey() {
  const raw = `${KEY_PREFIX}${randomBytes(24).toString("hex")}`;
  return { raw, hash: hashKey(raw) };
}

export async function createApiKey(label: string, staffId: string) {
  const { raw, hash } = generateApiKey();
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("api_keys")
    .insert({ label, key_hash: hash, staff_id: staffId })
    .select("id, label, created_at")
    .single();
  if (error) throw new Error(error.message);
  return { key: data, raw };
}

export async function listApiKeys() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("api_keys")
    .select("id, label, created_at, last_used_at, revoked_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function revokeApiKey(id: string) {
  const supabase = createServiceClient();
  const { error } = await supabase.from("api_keys").update({ revoked_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(error.message);
}

/**
 * Verifies a bearer token from the MCP endpoint's Authorization header.
 * Returns the staff id the key was issued to (or null if the key predates
 * that association), or null if the token is missing/invalid/revoked.
 */
export async function verifyApiKey(authorizationHeader: string | undefined) {
  if (!authorizationHeader?.startsWith("Bearer ")) return null;
  const raw = authorizationHeader.slice("Bearer ".length).trim();
  if (!raw) return null;

  const hash = hashKey(raw);
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("api_keys")
    .select("id, staff_id, revoked_at")
    .eq("key_hash", hash)
    .maybeSingle();

  if (error || !data || data.revoked_at) return null;

  // Best-effort — never block a request on this write failing.
  void supabase.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", data.id);

  return { apiKeyId: data.id as string, staffId: (data.staff_id as string | null) ?? null };
}
