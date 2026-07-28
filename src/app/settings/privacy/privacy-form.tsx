"use client";

import { useActionState } from "react";
import { updatePrivacySettings } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { ToggleField } from "@/components/ui/toggle-field";

const initialState = { ok: false, error: "" };

export function PrivacyForm({
  isPrivate,
  isAnonymous,
}: {
  isPrivate: boolean;
  isAnonymous: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await updatePrivacySettings(formData);
      return { ok: false, ...result };
    },
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-2.5">
      <ToggleField
        name="isPrivate"
        label="Private account"
        description="Only people who already follow you can see your posts and pets. Existing followers keep access — there is no approval queue."
        defaultChecked={isPrivate}
      />
      <ToggleField
        name="isAnonymous"
        label="Stay anonymous"
        description="Hides your name and photo everywhere. Messaging and moderation still reach the real account. Your pets stay visible unless you hide them separately."
        defaultChecked={isAnonymous}
      />

      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.ok && <p className="text-sm text-primary">Privacy settings saved.</p>}

      <Button type="submit" className="mt-1.5" disabled={pending}>
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
