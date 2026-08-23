import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MobileNav, DesktopNav } from "@/components/layout/MobileNav";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { OnboardingModal } from "@/features/profile/OnboardingModal";
import { Logo } from "@/components/Logo";
import { getProfile } from "@/features/profile/data";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  // Primera vez (o perfil sin completar): mostramos el modal de bienvenida.
  const needsOnboarding = profile ? !profile.onboarded : true;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-bg/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-5 py-3">
          <Link href="/nueva" className="flex items-center">
            <Logo iconSize={30} textClass="text-lg" />
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

      {needsOnboarding && (
        <OnboardingModal
          defaultName={
            profile?.display_name ||
            (user.user_metadata?.full_name as string | undefined) ||
            (user.email ? user.email.split("@")[0] : "")
          }
        />
      )}
    </div>
  );
}
