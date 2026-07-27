import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

      {owner.bio && !owner.isAnonymous && <p>{owner.bio}</p>}

      <p className="text-sm text-muted">
        <span className="font-medium text-foreground">{owner._count.followers}</span> followers ·{" "}
        <span className="font-medium text-foreground">{owner._count.following}</span> following
      </p>

      {owner.pets.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="font-medium">Pets</h2>
          {owner.pets.map((pet) => (
            <Link key={pet.id} href={`/pets/${pet.id}`}>
              <Card className="flex items-center gap-3 transition-colors hover:bg-muted-bg">
                <Avatar name={pet.name} src={pet.isAnonymous ? null : pet.avatarUrl} size="sm" />
                <span>
                  {pet.name} <span className="text-sm text-muted">({pet.species})</span>
                </span>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
