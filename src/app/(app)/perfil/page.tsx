import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/features/profile/ProfileForm";

export const metadata: Metadata = { title: "Perfil" };

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, institution")
    .eq("id", user!.id)
    .maybeSingle();

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-brand">Perfil</h1>
      <p className="mt-2 text-muted">
        Estos datos precargan tus planificaciones. Podés editarlos cuando quieras.
      </p>
      <ProfileForm
        email={user!.email ?? ""}
        displayName={profile?.display_name ?? ""}
        institution={profile?.institution ?? ""}
      />
    </div>
  );
}
