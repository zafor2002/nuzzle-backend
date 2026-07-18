"use client";

import { useTransition } from "react";
import { toggleLike } from "@/app/actions/engagement";

export function LikeButton({
  postId,
  likeCount,
  liked,
}: {
  postId: string;
  likeCount: number;
  liked: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => toggleLike(postId))}
      className={`rounded border px-3 py-1 text-sm disabled:opacity-50 ${
        liked ? "bg-black text-white" : ""
      }`}
    >
      {liked ? "Liked" : "Like"} ({likeCount})
    </button>
  );
}
