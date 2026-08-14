import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/**
 * Fetches the signed-in user's Staff profile. Middleware already guarantees
 * a session exists for any route that reaches here, but we still redirect
 * defensively (e.g. a session whose staff row was never created).
 */
export async function requireStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const staff = await prisma.staff.findUnique({ where: { id: user.id } });

  if (!staff) {
    redirect("/login?error=compte_non_configure");
  }

  return { user, staff };
}
