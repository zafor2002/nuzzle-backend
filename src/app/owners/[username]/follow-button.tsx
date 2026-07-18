"use client";

import { useTransition } from "react";
import { toggleFollow } from "@/app/actions/follows";
import { Button } from "@/components/ui/button";

export function FollowButton({
  ownerId,
  following,
}: {
  ownerId: string;
  following: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant={following ? "secondary" : "primary"}
      disabled={pending}
      onClick={() => startTransition(() => toggleFollow(ownerId))}
    >
      {following ? "Following" : "Follow"}
    </Button>
  );
}
