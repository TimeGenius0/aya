import { PawIcon, LogoutIcon } from "./icons";
import { signOut } from "@/lib/actions/auth";

export function MobileTopBar() {
  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:hidden">
      <div className="flex items-center gap-2">
        <PawIcon className="text-brand" />
        <span className="text-sm font-semibold">Aya Handous</span>
      </div>
      <form action={signOut}>
        <button
          type="submit"
          title="Se déconnecter"
          className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-muted"
        >
          <LogoutIcon />
        </button>
      </form>
    </header>
  );
}
