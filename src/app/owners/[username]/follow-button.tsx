"use client";

import { useTransition } from "react";
import { toggleFollow } from "@/app/actions/follows";

export function FollowButton({
  ownerId,
  following,
}: {
  ownerId: string;
  following: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => toggleFollow(ownerId))}
      className={`rounded px-4 py-2 text-sm disabled:opacity-50 ${
        following ? "border" : "bg-black text-white"
      }`}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
