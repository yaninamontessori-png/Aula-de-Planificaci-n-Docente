import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 py-16 text-center">
      <p className="font-heading text-5xl font-bold text-brand">404</p>
      <h1 className="mt-4 font-heading text-2xl font-bold text-ink">
        No encontramos esta página
      </h1>
      <p className="mt-2 text-muted">
        Es posible que el enlace haya cambiado o que la página ya no exista.
      </p>
      <Link href="/" className={`${buttonClasses("primary", "lg")} mt-6`}>
        Volver al inicio
      </Link>
    </main>
  );
}
