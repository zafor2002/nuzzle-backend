import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { logout } from "@/app/actions/auth";
import { FollowButton } from "./follow-button";

export default async function OwnerProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const owner = await prisma.owner.findUnique({
    where: { username },
    include: {
      pets: true,
      _count: { select: { followers: true, following: true } },
    },
  });

  if (!owner) {
    notFound();
  }

  const isSelf = user?.id === owner.id;
  const isFollowing = user
    ? Boolean(
        await prisma.follow.findUnique({
          where: { followerId_followingId: { followerId: user.id, followingId: owner.id } },
        })
      )
    : false;

  const displayName = owner.isAnonymous ? "Anonymous" : owner.displayName;

  return (
    <main className="mx-auto flex w-full min-h-[calc(100vh-65px)] max-w-lg flex-col gap-4 p-6">
      <Link href="/feed" className="text-sm text-muted hover:text-primary">
        &larr; Back to feed
      </Link>

      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={displayName} src={owner.isAnonymous ? null : owner.avatarUrl} size="lg" />
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold">{displayName}</h1>
            <p className="truncate text-sm text-muted">@{owner.username}</p>
          </div>
        </div>
        {isSelf && (
          <div className="flex items-center gap-2">
            <Link href={`/owners/${owner.username}/edit`}>
              <Button variant="secondary" size="sm">
                Edit profile
              </Button>
            </Link>
            <form action={logout}>
              <button
                type="submit"
                aria-label="Log out"
                title="Log out"
                className="flex h-[34px] w-[34px] items-center justify-center rounded-xl text-muted hover:bg-muted-bg hover:text-foreground"
              >
                <Icon name="logout" className="h-5 w-5" />
              </button>
            </form>
          </div>
        )}
        {!isSelf && user && (
          <div className="flex items-center gap-2">
            <Link href={`/messages/${owner.username}`}>
              <Button variant="secondary">Message</Button>
            </Link>
            <FollowButton ownerId={owner.id} following={isFollowing} />
          </div>
        )}
      </div>

      {owner.bio && !owner.isAnonymous && <p className="text-sm leading-relaxed">{owner.bio}</p>}

      <Card padded={false} className="flex py-3">
        {[
          { label: "Pets", value: owner.pets.length },
          { label: "Followers", value: owner._count.followers },
          { label: "Following", value: owner._count.following },
        ].map((stat) => (
          <div key={stat.label} className="flex-1 text-center">
            <p className="text-base font-bold">{stat.value}</p>
            <p className="text-[11.5px] text-muted">{stat.label}</p>
          </div>
        ))}
      </Card>

      <section>
        <div className="mb-2 flex items-center">
          <h2 className="flex-1 text-[13px] font-bold text-muted">Pets</h2>
          {isSelf && (
            <Link href="/pets/new" className="text-[11.5px] font-bold text-primary">
              + Add pet
            </Link>
          )}
        </div>

        {owner.pets.length === 0 ? (
          <EmptyState icon="pawprint" title={isSelf ? "No pets yet" : "No pets to show"}>
            {isSelf
              ? "Add a pet to give them their own profile and followers."
              : `${displayName} hasn't added any pets yet.`}
          </EmptyState>
        ) : (
          <div className="-mx-6 flex gap-2.5 overflow-x-auto px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {owner.pets.map((pet) => (
              <Link
                key={pet.id}
                href={`/pets/${pet.id}`}
                className="w-[150px] shrink-0 rounded-md border border-border bg-card p-3.5 transition-colors hover:bg-muted-bg"
              >
                <Avatar name={pet.name} src={pet.isAnonymous ? null : pet.avatarUrl} size="lg" />
                <p className="mt-2.5 truncate text-sm font-bold">{pet.name}</p>
                <p className="mt-0.5 truncate text-[11.5px] text-muted">
                  {pet.breed || pet.species}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
