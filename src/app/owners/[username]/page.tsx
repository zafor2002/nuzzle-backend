import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
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
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-4 p-6">
      <Link href="/feed" className="text-sm underline">
        &larr; Back to feed
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{displayName}</h1>
          <p className="text-gray-500">@{owner.username}</p>
        </div>
        {!isSelf && user && <FollowButton ownerId={owner.id} following={isFollowing} />}
      </div>

      {owner.bio && !owner.isAnonymous && <p>{owner.bio}</p>}

      <p className="text-sm text-gray-500">
        {owner._count.followers} followers · {owner._count.following} following
      </p>

      {owner.pets.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="font-medium">Pets</h2>
          {owner.pets.map((pet) => (
            <Link
              key={pet.id}
              href={`/pets/${pet.id}`}
              className="rounded border px-4 py-2 text-left"
            >
              {pet.name} <span className="text-sm text-gray-500">({pet.species})</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
