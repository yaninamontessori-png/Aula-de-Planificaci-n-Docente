import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Wizard } from "@/features/plans/Wizard";
import { getProfile } from "@/features/profile/data";

export const metadata: Metadata = { title: "Nueva planificación" };

export default async function NuevaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = await getProfile(user!.id);

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wider text-muted">
        Paso a paso
      </p>
      <h1 className="mb-6 mt-1 font-heading text-3xl font-bold text-ink">
        Nueva planificación
      </h1>
      <Wizard
        defaultTeacherName={profile?.display_name ?? ""}
        defaultInstitution={profile?.institution ?? ""}
        defaultGrade={profile?.default_grade ?? 3}
        skillsCount={profile?.teaching_skills?.length ?? 0}
      />
    </div>
  );
}
