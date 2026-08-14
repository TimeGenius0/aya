import { createClient } from "@/lib/supabase/client";

/**
 * Looks for a Supabase access_token/refresh_token pair wherever they might
 * have landed — URL fragment (the normal implicit-flow location), query
 * string, or even directly embedded in the path (a known failure mode when
 * an email link-scanner mangles the "#" of a redirect_to before the human
 * clicks it). Regex over the full href rather than URLSearchParams because
 * that last case isn't valid query-string syntax. If a pair is found,
 * establishes the session and returns true.
 */
export async function consumeImplicitTokensFromLocation(): Promise<boolean> {
  const href = window.location.href;
  const accessToken = href.match(/[?&#/]access_token=([^&#]+)/)?.[1];
  const refreshToken = href.match(/[?&#/]refresh_token=([^&#]+)/)?.[1];
  if (!accessToken || !refreshToken) return false;

  const supabase = createClient();
  await supabase.auth.setSession({
    access_token: decodeURIComponent(accessToken),
    refresh_token: decodeURIComponent(refreshToken),
  });
  return true;
}
