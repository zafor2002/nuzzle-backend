"use client";

import { useActionState, useRef } from "react";
import { changePassword } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";

const initialState = { ok: false, error: "" };

export function PasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await changePassword(formData);
      // Don't leave the old and new passwords sitting in the fields once the
      // change has gone through.
      if (result?.ok) formRef.current?.reset();
      return { ok: false, ...result };
    },
    initialState
  );

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <Field label="Current password">
        <Input name="currentPassword" type="password" autoComplete="current-password" required />
      </Field>
      <Field label="New password">
        <Input
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
        />
      </Field>
      <Field label="Confirm new password">
        <Input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
        />
      </Field>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.ok && <p className="text-sm text-primary">Password updated.</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Updating..." : "Update password"}
      </Button>
    </form>
  );
}
