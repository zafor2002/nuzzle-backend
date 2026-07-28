import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Icon, type IconName } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { FollowButton } from "@/app/owners/[username]/follow-button";
import { Shell } from "@/components/shell";

const SHORTCUTS: { href: string; label: string; icon: IconName }[] = [
  { href: "/reels", label: "Reels", icon: "camera" },
  { href: "/communities", label: "Communities", icon: "pawprint" },
  { href: "/adoption", label: "Adopt", icon: "heart" },
  { href: "/vet", label: "Book a vet", icon: "cross" },
  { href: "/marketplace", label: "Marketplace", icon: "cart" },
  { href: "/lost-found", label: "Lost & Found", icon: "siren" },
];

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

  const communities = await prisma.pet.groupBy({
    by: ["species"],
    _count: { _all: true },
    orderBy: { _count: { species: "desc" } },
    take: 6,
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
    <Shell>
      <div className="flex flex-col gap-4">
        <PageHeader title="Explore" />

        <form action="/search" className="flex h-11 items-center gap-2 rounded-[14px] bg-muted-bg px-3.5">
          <Icon name="search" className="h-[18px] w-[18px] shrink-0 text-muted" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="People, pets, #tags, captions…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </form>

        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SHORTCUTS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border-[1.5px] border-border bg-card px-3.5 py-2 text-[12.5px] font-semibold text-muted transition-colors hover:bg-muted-bg"
            >
              <Icon name={s.icon} className="h-4 w-4" />
              {s.label}
            </Link>
          ))}
        </div>

        {communities.length > 0 && (
          <section>
            <div className="mb-2 flex items-center">
              <h2 className="flex-1 text-[13px] font-bold text-muted">Communities</h2>
              <Link href="/communities" className="text-[11.5px] font-bold text-primary">
                See all
              </Link>
            </div>
            <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {communities.map((c) => (
                <Link
                  key={c.species}
                  href={`/communities/${encodeURIComponent(c.species)}`}
                  className="w-28 shrink-0 rounded-md border border-border bg-card p-3.5 text-center"
                >
                  <div className="mb-2 flex justify-center">
                    <Avatar name={c.species} size="lg" />
                  </div>
                  <p className="truncate text-[11.5px] font-bold">{c.species}</p>
                  <p className="mt-0.5 text-[11.5px] text-muted">
                    {c._count._all} {c._count._all === 1 ? "pet" : "pets"}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-2 text-[13px] font-bold text-muted">
            {query ? "Results" : "Owners to follow"}
          </h2>

          {owners.length === 0 ? (
            <EmptyState icon="search" title={query ? "No matches" : "Nobody here yet"}>
              {query ? `No one matching “${query}”.` : "New owners will show up here as they join."}
            </EmptyState>
          ) : (
            <div className="flex flex-col gap-2.5">
              {owners.map((owner) => {
                const displayName = owner.isAnonymous ? "Anonymous" : owner.displayName;
                return (
                  <Card key={owner.id} padded={false} className="flex items-center gap-3 p-3">
                    <Link href={`/owners/${owner.username}`} className="flex min-w-0 flex-1 items-center gap-3">
                      <Avatar name={displayName} src={owner.isAnonymous ? null : owner.avatarUrl} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{displayName}</p>
                        <p className="truncate text-[11.5px] text-muted">@{owner.username}</p>
                      </div>
                    </Link>
                    {user && <FollowButton ownerId={owner.id} following={followingIds.has(owner.id)} />}
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </Shell>
  );
}
