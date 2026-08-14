import { requireStaff } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { MobileTopBar } from "@/components/layout/MobileTopBar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { staff } = await requireStaff();

  return (
    <div className="flex min-h-dvh">
      <Sidebar staffName={staff.fullName} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar />
        <main className="flex-1 overflow-x-hidden px-4 pb-20 pt-4 md:px-8 md:pb-8 md:pt-8">
          {children}
        </main>
        <MobileTabBar />
      </div>
    </div>
  );
}
