"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";
import { LogoutIcon, PawIcon } from "./icons";
import { signOut } from "@/lib/actions/auth";

export function Sidebar({ staffName }: { staffName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <PawIcon className="text-brand" />
        <div>
          <p className="text-sm font-semibold leading-tight">Aya Handous</p>
          <p className="text-xs text-muted-foreground">Cabinet vétérinaire</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand/15 text-brand"
                  : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
              )}
            >
              <Icon className="shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-3 py-3">
        <div className="flex items-center justify-between rounded-lg px-3 py-2">
          <span className="truncate text-sm text-muted-foreground">{staffName}</span>
          <form action={signOut}>
            <button
              type="submit"
              title="Se déconnecter"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-muted hover:text-foreground"
            >
              <LogoutIcon />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
