import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/features/profile/ProfileForm";
import { getProfile } from "@/features/profile/data";

export const metadata: Metadata = { title: "Perfil" };

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = await getProfile(user!.id);

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-ink">Perfil</h1>
      <p className="mt-2 text-muted">
        Cargás tus datos y tus enfoques una sola vez. La IA los usa en cada planificación que
        generes.
      </p>
      <ProfileForm
        email={user!.email ?? ""}
        displayName={profile?.display_name ?? ""}
        institution={profile?.institution ?? ""}
        defaultGrade={profile?.default_grade ?? null}
        role={profile?.role ?? "docente"}
        subject={profile?.teaching_subject ?? "grado"}
        skills={profile?.teaching_skills ?? []}
        notes={profile?.pedagogical_notes ?? ""}
      />
    </div>
  );
}
