import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SideNav } from "@/components/layout/side-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="relative flex min-h-screen bg-background overflow-x-hidden">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 mesh-bg-fixed opacity-70 -z-10"
      />
      <SideNav />
      <main className="flex-1 md:pl-64 pb-28 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
