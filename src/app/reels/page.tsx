import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { isHidden } from "@/lib/visibility";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { ReelFeed } from "@/components/reel-feed";

export default async function ReelsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Private owners' reels are excluded the same way posts are.
  const following = user
    ? await prisma.follow.findMany({
        where: { followerId: user.id },
        select: { followingId: true },
      })
    : [];

  const visibility = user
    ? {
        OR: [
          { owner: { isPrivate: false } },
          { ownerId: user.id },
          { ownerId: { in: following.map((f) => f.followingId) } },
        ],
      }
    : { owner: { isPrivate: false } };

  const reels = await prisma.reel.findMany({
    where: visibility,
    orderBy: { createdAt: "desc" },
    take: 30,
    include: {
      owner: true,
      pet: true,
      _count: { select: { likes: true } },
      likes: { where: { ownerId: user?.id ?? "__none__" }, select: { ownerId: true } },
    },
  });

  const items = reels.map((reel) => {
    const hidden = isHidden(reel.pet, reel.owner);
    return {
      id: reel.id,
      videoUrl: reel.videoUrl,
      caption: reel.caption,
      likeCount: reel._count.likes,
      liked: reel.likes.length > 0,
      authorLabel: hidden ? "Anonymous" : reel.pet ? reel.pet.name : reel.owner.displayName,
      authorHref: hidden ? null : reel.pet ? `/pets/${reel.pet.id}` : `/owners/${reel.owner.username}`,
      avatarUrl: hidden ? null : reel.pet ? reel.pet.avatarUrl : reel.owner.avatarUrl,
    };
  });

  if (items.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-lg flex-col px-4 py-4">
        <EmptyState
          icon="camera"
          title="No reels yet"
          action={
            user ? (
              <Link href="/reels/new">
                <Button size="sm">Post a reel</Button>
              </Link>
            ) : undefined
          }
        >
          Short pet videos will show up here.
        </EmptyState>
      </main>
    );
  }

  return <ReelFeed items={items} signedIn={Boolean(user)} />;
}
