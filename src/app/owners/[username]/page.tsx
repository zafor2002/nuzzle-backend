import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
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
    <main className="mx-auto flex w-full min-h-[calc(100vh-97px)] max-w-lg flex-col gap-4 p-6">
      <Link href="/feed" className="text-sm text-muted hover:text-primary">
        &larr; Back to feed
      </Link>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={displayName} size="lg" />
          <div>
            <h1 className="text-xl font-semibold">{displayName}</h1>
            <p className="text-sm text-muted">@{owner.username}</p>
          </div>
        </div>
        {!isSelf && user && <FollowButton ownerId={owner.id} following={isFollowing} />}
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
                <Avatar name={pet.name} size="sm" />
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
