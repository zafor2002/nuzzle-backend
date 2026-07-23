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

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isAnonymous" defaultChecked={isAnonymous} />
        Keep my identity anonymous (hides my name across the app)
      </label>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
