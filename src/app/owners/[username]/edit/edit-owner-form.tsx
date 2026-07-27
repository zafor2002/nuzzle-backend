"use client";

import { useActionState } from "react";
import { updateOwnerProfile } from "@/app/actions/profile";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AvatarUpload } from "@/components/avatar-upload";

const initialState = { error: "" };

export function EditOwnerForm({
  ownerId,
  displayName,
  bio,
  avatarUrl,
  isAnonymous,
}: {
  ownerId: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  isAnonymous: boolean;
}) {
  const [state, formAction, pending] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    const result = await updateOwnerProfile(formData);
    return result ?? initialState;
  }, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <AvatarUpload
        ownerId={ownerId}
        fieldName="avatarUrl"
        initialUrl={avatarUrl}
        fallbackName={displayName}
      />

      <Input name="displayName" type="text" placeholder="Your name" defaultValue={displayName} required />
      <Textarea name="bio" placeholder="Bio (optional)" rows={3} defaultValue={bio} />

      <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-card p-3.5">
        <input
          type="checkbox"
          name="isAnonymous"
          defaultChecked={isAnonymous}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--primary)]"
        />
        <span className="min-w-0">
          <span className="block text-sm font-bold text-foreground">Stay anonymous</span>
          <span className="mt-1 block text-[11.5px] leading-relaxed text-muted">
            Hides your name and photo everywhere. Your pets stay visible unless you hide them
            separately.
          </span>
        </span>
      </label>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
