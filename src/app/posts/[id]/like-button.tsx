"use client";

import { useTransition } from "react";
import { toggleLike } from "@/app/actions/engagement";
import { Button } from "@/components/ui/button";

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
    <Button
      type="button"
      variant={liked ? "primary" : "secondary"}
      disabled={pending}
      onClick={() => startTransition(() => toggleLike(postId))}
      className="self-start"
    >
      {liked ? "❤️ Liked" : "🤍 Like"} ({likeCount})
    </Button>
  );
}
