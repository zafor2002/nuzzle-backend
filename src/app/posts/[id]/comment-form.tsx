"use client";

import { useActionState } from "react";
import { addComment } from "@/app/actions/engagement";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState = { error: "" };

export function CommentForm({ postId }: { postId: string }) {
  const [state, formAction, pending] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    const result = await addComment(postId, formData);
    return result ?? initialState;
  }, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <Textarea name="body" placeholder="Add a comment..." rows={2} required className="text-sm" />
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Posting..." : "Comment"}
      </Button>
    </form>
  );
}
