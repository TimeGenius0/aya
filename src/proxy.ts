import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes reachable without a session. Everything else redirects to /login.
// "/" is included because Supabase can land recovery/magic-link tokens there
// as a URL fragment (server/middleware never sees fragments) — the root
// page itself checks for and consumes those tokens client-side before
// deciding where to send the visitor next.
const PUBLIC_PATHS = ["/login", "/auth/callback", "/"];

// The MCP endpoint has its own bearer-token auth (see src/lib/mcp/apiKeyAuth.ts)
// and must never be redirected to /login — MCP clients don't have cookies.
const BYPASS_PREFIXES = ["/api/mcp", "/_next", "/favicon.ico", "/manifest.webmanifest", "/icons", "/sw.js"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (BYPASS_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refreshes the session cookie if the access token is stale — must be
  // called before any redirect decision below, per @supabase/ssr's contract.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (!user && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except static assets. We still filter API/asset
     * prefixes inside the function above (needed since matcher itself
     * can't easily express the MCP bypass alongside the rest).
     */
    "/((?!_next/static|_next/image).*)",
  ],
};
