import { redirect } from "next/navigation";

export default function RootPage() {
  // Middleware already sends unauthenticated requests to /login before this
  // ever renders, so an authenticated visitor lands on the dashboard here.
  redirect("/dashboard");
}
