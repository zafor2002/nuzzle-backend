"use client";

import { useActionState } from "react";
import { createPet } from "@/app/actions/pets";

const initialState = { error: "" };

export function PetForm() {
  const [state, formAction, pending] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    const result = await createPet(formData);
    return result ?? initialState;
  }, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input
        name="name"
        type="text"
        placeholder="Pet's name"
        required
        className="rounded border px-3 py-2"
      />
      <input
        name="species"
        type="text"
        placeholder="Species (e.g. Dog, Cat)"
        required
        className="rounded border px-3 py-2"
      />
      <input
        name="breed"
        type="text"
        placeholder="Breed (optional)"
        className="rounded border px-3 py-2"
      />
      <textarea
        name="bio"
        placeholder="Bio (optional)"
        rows={3}
        className="rounded border px-3 py-2"
      />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isAnonymous" />
        Keep this pet&apos;s profile anonymous (hides your identity)
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
      >
        {pending ? "Creating..." : "Create pet profile"}
      </button>
    </form>
  );
}
