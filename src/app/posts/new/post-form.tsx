"use client";

import { useActionState } from "react";
import { createPost } from "@/app/actions/posts";

const initialState = { error: "" };

export function PostForm({ pets }: { pets: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    const result = await createPost(formData);
    return result ?? initialState;
  }, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {pets.length > 0 && (
        <select name="petId" className="rounded border px-3 py-2">
          <option value="">Post as yourself</option>
          {pets.map((pet) => (
            <option key={pet.id} value={pet.id}>
              Post as {pet.name}
            </option>
          ))}
        </select>
      )}

      <textarea
        name="caption"
        placeholder="What's happening?"
        rows={3}
        className="rounded border px-3 py-2"
      />
      <input
        name="mediaUrl"
        type="url"
        placeholder="Image URL (optional)"
        className="rounded border px-3 py-2"
      />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
      >
        {pending ? "Posting..." : "Post"}
      </button>
    </form>
  );
}
