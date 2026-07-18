import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
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
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Explore</h1>

      {owners.length === 0 && <p className="text-gray-500">No one to follow yet.</p>}

      <div className="flex flex-col gap-3">
        {owners.map((owner) => (
          <div key={owner.id} className="flex items-center justify-between rounded border px-4 py-3">
            <Link href={`/owners/${owner.username}`}>
              <p className="font-medium">{owner.isAnonymous ? "Anonymous" : owner.displayName}</p>
              <p className="text-sm text-gray-500">@{owner.username}</p>
            </Link>
            {user && <FollowButton ownerId={owner.id} following={followingIds.has(owner.id)} />}
          </div>
        ))}
      </div>
    </main>
  );
}
