"use client";

import { useTransition } from "react";
import { toggleLike } from "@/app/actions/engagement";
import { Icon } from "@/components/ui/icon";

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
      className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[13px] font-semibold transition-colors hover:bg-muted-bg disabled:opacity-50 ${
        liked ? "text-danger" : "text-muted"
      }`}
      aria-pressed={liked}
      aria-label={liked ? "Unlike" : "Like"}
    >
      <Icon name="heart" className="h-5 w-5" filled={liked} />
      {likeCount}
    </button>
  );
}
