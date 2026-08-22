import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacidad" };

export default function PrivacidadPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-12">
      <Link href="/" className="text-sm font-semibold text-muted hover:text-brand">
        ← Inicio
      </Link>
      <h1 className="mt-4 font-heading text-3xl font-bold text-brand">
        Política de privacidad
      </h1>
      <div className="mt-6 space-y-4 leading-relaxed text-ink">
        <p>
          Esta aplicación está pensada para docentes de Educación Primaria. Al ingresar
          con Google, guardamos únicamente los datos necesarios para identificarte (nombre
          y correo asociados a tu cuenta) y las planificaciones que decidas crear.
        </p>
        <h2 className="font-heading text-xl font-bold text-brand">Qué guardamos</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Tu perfil docente: nombre visible, institución y provincia.</li>
          <li>Las planificaciones que generás y editás.</li>
          <li>Registros técnicos del uso de la generación con IA.</li>
        </ul>
        <h2 className="font-heading text-xl font-bold text-brand">Qué no guardamos</h2>
        <p>
          No almacenamos nombres de estudiantes ni datos personales de niñas y niños. Cada
          docente accede exclusivamente a su propia información.
        </p>
        <h2 className="font-heading text-xl font-bold text-brand">Tus datos</h2>
        <p>
          Podés eliminar tus planificaciones en cualquier momento. Para dar de baja tu
          cuenta y todos tus datos asociados, escribinos.
        </p>
        <p className="text-sm text-muted">
          Este texto es una versión base y debe ser revisada por la institución antes de
          su publicación definitiva.
        </p>
      </div>
    </main>
  );
}
