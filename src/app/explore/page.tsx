import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FollowButton } from "@/app/owners/[username]/follow-button";

export default async function ExplorePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const owners = await prisma.owner.findMany({
    where: user ? { id: { not: user.id } } : undefined,
    take: 50,
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
    <main className="mx-auto flex w-full min-h-[calc(100vh-57px)] max-w-lg flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Explore</h1>

      {owners.length === 0 && <EmptyState>No one to follow yet.</EmptyState>}

      <div className="flex flex-col gap-3">
        {owners.map((owner) => {
          const displayName = owner.isAnonymous ? "Anonymous" : owner.displayName;
          return (
            <Card key={owner.id} className="flex items-center justify-between">
              <Link href={`/owners/${owner.username}`} className="flex items-center gap-3">
                <Avatar name={displayName} size="md" />
                <div>
                  <p className="font-medium">{displayName}</p>
                  <p className="text-sm text-muted">@{owner.username}</p>
                </div>
              </Link>
              {user && <FollowButton ownerId={owner.id} following={followingIds.has(owner.id)} />}
            </Card>
          );
        })}
      </div>
    </main>
  );
}
