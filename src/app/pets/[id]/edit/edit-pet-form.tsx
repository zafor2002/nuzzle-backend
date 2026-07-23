"use client";

import { useActionState } from "react";
import { updatePet } from "@/app/actions/profile";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AvatarUpload } from "@/components/avatar-upload";

const initialState = { error: "" };

export function EditPetForm({
  petId,
  ownerId,
  name,
  species,
  breed,
  bio,
  avatarUrl,
  isAnonymous,
}: {
  petId: string;
  ownerId: string;
  name: string;
  species: string;
  breed: string;
  bio: string;
  avatarUrl: string | null;
  isAnonymous: boolean;
}) {
  const [state, formAction, pending] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    const result = await updatePet(petId, formData);
    return result ?? initialState;
  }, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <AvatarUpload ownerId={ownerId} fieldName="avatarUrl" initialUrl={avatarUrl} fallbackName={name} />

      <Input name="name" type="text" placeholder="Pet's name" defaultValue={name} required />
      <Input name="species" type="text" placeholder="Species (e.g. Dog, Cat)" defaultValue={species} required />
      <Input name="breed" type="text" placeholder="Breed (optional)" defaultValue={breed} />
      <Textarea name="bio" placeholder="Bio (optional)" rows={3} defaultValue={bio} />

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isAnonymous" defaultChecked={isAnonymous} />
        Keep this pet&apos;s profile anonymous (hides your identity)
      </label>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
