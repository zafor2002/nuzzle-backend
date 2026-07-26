import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { PostCard } from "@/components/post-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Shell } from "@/components/shell";

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let ownerIdFilter: string[] | undefined;
  if (user) {
    const following = await prisma.follow.findMany({
      where: { followerId: user.id },
      select: { followingId: true },
    });
    ownerIdFilter = [user.id, ...following.map((f) => f.followingId)];
  }

  const posts = await prisma.post.findMany({
    where: ownerIdFilter ? { ownerId: { in: ownerIdFilter } } : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      owner: true,
      pet: true,
      _count: { select: { likes: true, comments: true } },
      likes: { where: { ownerId: user?.id ?? "__none__" }, select: { ownerId: true } },
    },
  });

  const isFollowingFeed = Boolean(ownerIdFilter);
  const isEmptyFollowingFeed = isFollowingFeed && posts.length === 0;

  return (
    <Shell>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Home</h1>

        {isEmptyFollowingFeed && (
          <EmptyState>
            No posts yet from people you follow.{" "}
            <Link href="/explore" className="text-primary underline">
              Explore
            </Link>{" "}
            to find pets and owners to follow.
          </EmptyState>
        )}
        {!isFollowingFeed && posts.length === 0 && <EmptyState>No posts yet.</EmptyState>}

        <div className="flex flex-col gap-2">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={user?.id} />
          ))}
        </div>
      </div>
    </Shell>
  );
}
