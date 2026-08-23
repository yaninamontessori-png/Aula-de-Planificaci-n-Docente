import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = { title: "Ingresar" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; error?: string }>;
}) {
  const { redirectTo, error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect(redirectTo || "/nueva");

  const next = redirectTo && redirectTo.startsWith("/") ? redirectTo : "/nueva";

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-16">
      <Link href="/" className="mb-8 text-sm font-semibold text-muted hover:text-brand">
        ← Volver al inicio
      </Link>
      <Logo iconSize={52} textClass="text-4xl" tagline className="mb-8" />
      <div className="rounded-2xl border border-border bg-surface p-7">
        <h1 className="font-heading text-2xl font-bold text-brand">
          Ingresá para planificar
        </h1>
        <p className="mt-2 text-muted">
          Usá tu cuenta de Google. No necesitás crear una contraseña. Cada docente ve
          únicamente sus propias planificaciones.
        </p>

        <div className="mt-6">
          <GoogleButton redirectTo={next} />
        </div>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-danger-bg p-3 text-sm text-danger"
          >
            No pudimos completar el ingreso. Probá nuevamente.
          </p>
        )}

        <p className="mt-6 text-xs text-muted">
          Al ingresar aceptás nuestros{" "}
          <Link href="/terminos" className="underline">
            Términos
          </Link>{" "}
          y la{" "}
          <Link href="/privacidad" className="underline">
            Política de privacidad
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
