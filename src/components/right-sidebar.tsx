import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FollowButton } from "@/app/owners/[username]/follow-button";

export async function RightSidebar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const owners = await prisma.owner.findMany({
    where: user ? { id: { not: user.id } } : undefined,
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  const followingIds = user
    ? new Set(
        (
          await prisma.follow.findMany({
            where: { followerId: user.id },
            select: { followingId: true },
          })
        ).map((f) => f.followingId)
      )
    : new Set<string>();

  return (
    <div className="sticky top-[65px] flex flex-col gap-3">
      {user && (
        <Card className="flex flex-col gap-2">
          <p className="font-medium">Share something</p>
          <Link href="/posts/new">
            <Button className="w-full">Create post</Button>
          </Link>
        </Card>
      )}

      {owners.length > 0 && (
        <Card className="flex flex-col gap-2 p-3">
          <p className="text-sm font-semibold">Who to follow</p>
          {owners.map((owner) => {
            const displayName = owner.isAnonymous ? "Anonymous" : owner.displayName;
            return (
              <div key={owner.id} className="flex items-center justify-between gap-2">
                <Link href={`/owners/${owner.username}`} className="flex min-w-0 items-center gap-2">
                  <Avatar name={displayName} src={owner.isAnonymous ? null : owner.avatarUrl} size="sm" />
                  <span className="truncate text-sm">{displayName}</span>
                </Link>
                {user && <FollowButton ownerId={owner.id} following={followingIds.has(owner.id)} />}
              </div>
            );
          })}
          <Link href="/explore" className="text-sm text-primary hover:underline">
            See more
          </Link>
        </Card>
      )}
    </div>
  );
}
