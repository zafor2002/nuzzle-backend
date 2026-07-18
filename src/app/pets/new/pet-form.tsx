"use client";

import { useActionState } from "react";
import { createPet } from "@/app/actions/pets";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState = { error: "" };

export function PetForm() {
  const [state, formAction, pending] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    const result = await createPet(formData);
    return result ?? initialState;
  }, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input name="name" type="text" placeholder="Pet's name" required />
      <Input name="species" type="text" placeholder="Species (e.g. Dog, Cat)" required />
      <Input name="breed" type="text" placeholder="Breed (optional)" />
      <Textarea name="bio" placeholder="Bio (optional)" rows={3} />
      <label className="flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" name="isAnonymous" />
        Keep this pet&apos;s profile anonymous (hides your identity)
      </label>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Creating..." : "Create pet profile"}
      </Button>
    </form>
  );
}
