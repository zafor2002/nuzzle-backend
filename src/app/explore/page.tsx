import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import { FollowButton } from "@/app/owners/[username]/follow-button";
import { Shell } from "@/components/shell";
import { LeftSidebar } from "@/components/left-sidebar";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const owners = await prisma.owner.findMany({
    where: {
      ...(user ? { id: { not: user.id } } : {}),
      ...(query
        ? {
            OR: [
              { displayName: { contains: query, mode: "insensitive" } },
              { username: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
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
    <Shell left={<LeftSidebar />}>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Explore</h1>

        <form
          action="/explore"
          className="flex items-center gap-2 rounded-md border border-border/60 bg-card/60 px-4 py-3 shadow-sm backdrop-blur-md"
        >
          <Icon name="search" className="h-5 w-5 shrink-0 text-muted" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search owners by name or username"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </form>

        <div className="flex gap-2 lg:hidden">
          <Link
            href="/communities"
            className="flex flex-1 items-center justify-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium"
          >
            🐾 Communities
          </Link>
          <Link
            href="/lost-found"
            className="flex flex-1 items-center justify-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium"
          >
            <Icon name="siren" className="h-4 w-4" /> Lost & Found
          </Link>
        </div>

        {owners.length === 0 && (
          <EmptyState>{query ? `No one matching "${query}".` : "No one to follow yet."}</EmptyState>
        )}

        <div className="flex flex-col gap-3">
          {owners.map((owner) => {
            const displayName = owner.isAnonymous ? "Anonymous" : owner.displayName;
            return (
              <Card key={owner.id} className="flex items-center justify-between">
                <Link href={`/owners/${owner.username}`} className="flex items-center gap-3">
                  <Avatar name={displayName} src={owner.isAnonymous ? null : owner.avatarUrl} size="md" />
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
      </div>
    </Shell>
  );
}
