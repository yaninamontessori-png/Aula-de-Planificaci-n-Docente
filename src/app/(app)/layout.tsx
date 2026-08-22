import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MobileNav, DesktopNav } from "@/components/layout/MobileNav";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-bg/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-5 py-3">
          <Link href="/nueva" className="font-heading font-bold text-brand">
            Aula de Planificación
          </Link>
          <div className="flex items-center gap-4">
            <DesktopNav />
            <div className="hidden text-right sm:block">
              <span className="block max-w-[180px] truncate text-xs text-muted">
                {user.email}
              </span>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-5 pb-24 pt-6 md:pb-10">
        {children}
      </main>

      <MobileNav />
    </div>
  );
}
