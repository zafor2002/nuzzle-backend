"use client";

import { useTransition } from "react";
import { toggleLike } from "@/app/actions/engagement";

export function VoteArrow({
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
      className="flex w-10 shrink-0 flex-col items-center gap-0.5 rounded-md py-2 text-muted transition-colors hover:bg-muted-bg disabled:opacity-50"
      aria-pressed={liked}
      aria-label={liked ? "Remove upvote" : "Upvote"}
    >
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        className={liked ? "text-primary" : ""}
      >
        <path d="M12 4l8 9h-5v7H9v-7H4z" strokeLinejoin="round" />
      </svg>
      <span className={`text-xs font-semibold ${liked ? "text-primary" : ""}`}>
        {likeCount}
      </span>
    </button>
  );
}
