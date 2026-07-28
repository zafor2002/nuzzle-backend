"use client";

import { useActionState } from "react";
import { updateNotificationSettings } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { ToggleField } from "@/components/ui/toggle-field";

const initialState = { ok: false, error: "" };

export function NotificationsForm({
  notifyLikes,
  notifyComments,
  notifyFollows,
}: {
  notifyLikes: boolean;
  notifyComments: boolean;
  notifyFollows: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await updateNotificationSettings(formData);
      return { ok: false, ...result };
    },
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-2.5">
      <ToggleField
        name="notifyLikes"
        label="Likes"
        description="When someone likes one of your posts."
        defaultChecked={notifyLikes}
      />
      <ToggleField
        name="notifyComments"
        label="Comments"
        description="When someone comments on one of your posts."
        defaultChecked={notifyComments}
      />
      <ToggleField
        name="notifyFollows"
        label="New followers"
        description="When someone starts following you."
        defaultChecked={notifyFollows}
      />

      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.ok && <p className="text-sm text-primary">Notification settings saved.</p>}

      <Button type="submit" className="mt-1.5" disabled={pending}>
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
