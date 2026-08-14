import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — bypasses Row Level Security entirely.
 * Server-only. Never import this from a Client Component or expose the key
 * to the browser. Used for: the MCP server (no interactive user session to
 * carry RLS's `auth.role()`) and API key lookups (api_keys has no RLS policy
 * at all, so only this client can read it).
 */
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
