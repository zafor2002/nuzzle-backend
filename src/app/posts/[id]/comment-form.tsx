"use client";

import { useActionState } from "react";
import { addComment } from "@/app/actions/engagement";

const initialState = { error: "" };

export function CommentForm({ postId }: { postId: string }) {
  const [state, formAction, pending] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    const result = await addComment(postId, formData);
    return result ?? initialState;
  }, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <textarea
        name="body"
        placeholder="Add a comment..."
        rows={2}
        required
        className="rounded border px-3 py-2 text-sm"
      />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-50"
      >
        {pending ? "Posting..." : "Comment"}
      </button>
    </form>
  );
}
