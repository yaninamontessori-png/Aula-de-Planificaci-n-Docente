"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileActionState } from "./actions";
import { Button } from "@/components/ui/Button";

export function ProfileForm({
  email,
  displayName,
  institution,
}: {
  email: string;
  displayName: string;
  institution: string;
}) {
  const [state, action, pending] = useActionState<ProfileActionState, FormData>(
    updateProfile,
    {},
  );

  return (
    <form
      action={action}
      className="mt-6 space-y-5 rounded-2xl border border-border bg-surface p-6"
    >
      <div>
        <label className="mb-1.5 block text-sm font-bold" htmlFor="email">
          Correo
        </label>
        <input
          id="email"
          value={email}
          readOnly
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-3 text-muted"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-bold" htmlFor="display_name">
          Nombre visible
        </label>
        <input
          id="display_name"
          name="display_name"
          defaultValue={displayName}
          required
          className="w-full rounded-lg border border-border bg-surface px-3 py-3"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-bold" htmlFor="institution">
          Institución
        </label>
        <input
          id="institution"
          name="institution"
          defaultValue={institution}
          placeholder="Nombre de la escuela"
          className="w-full rounded-lg border border-border bg-surface px-3 py-3"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Guardar cambios"}
        </Button>
        {state.ok && (
          <span role="status" className="text-sm font-semibold text-brand">
            Perfil actualizado.
          </span>
        )}
        {state.error && (
          <span role="alert" className="text-sm font-semibold text-danger">
            {state.error}
          </span>
        )}
      </div>
    </form>
  );
}
