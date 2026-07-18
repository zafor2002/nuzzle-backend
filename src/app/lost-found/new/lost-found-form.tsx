"use client";

import { useActionState } from "react";
import { createLostFoundPost } from "@/app/actions/lost-found";

const initialState = { error: "" };

export function LostFoundForm({ pets }: { pets: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    const result = await createLostFoundPost(formData);
    return result ?? initialState;
  }, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <select name="status" className="rounded border px-3 py-2" defaultValue="lost">
        <option value="lost">Lost</option>
        <option value="found">Found</option>
      </select>

      {pets.length > 0 && (
        <select name="petId" className="rounded border px-3 py-2">
          <option value="">Not one of my pets</option>
          {pets.map((pet) => (
            <option key={pet.id} value={pet.id}>
              {pet.name}
            </option>
          ))}
        </select>
      )}

      <textarea
        name="description"
        placeholder="Description (where/when last seen, distinguishing features, etc.)"
        rows={4}
        required
        className="rounded border px-3 py-2"
      />
      <input
        name="contactInfo"
        type="text"
        placeholder="Contact info (phone, email, etc.)"
        className="rounded border px-3 py-2"
      />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
      >
        {pending ? "Posting..." : "Post report"}
      </button>
    </form>
  );
}
