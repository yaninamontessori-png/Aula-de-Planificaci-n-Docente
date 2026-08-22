"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 py-16 text-center">
      <h1 className="font-heading text-2xl font-bold text-ink">Algo salió mal</h1>
      <p className="mt-2 text-muted">
        Ocurrió un error inesperado. Podés intentar nuevamente.
      </p>
      <Button size="lg" className="mt-6" onClick={() => reset()}>
        Reintentar
      </Button>
    </main>
  );
}
