import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { visiblePostWhere } from "@/lib/privacy";
import { getStoryGroups } from "@/lib/stories";
import { StoryTray } from "@/components/story-tray";
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

  // Signed in, the follow filter already implies visibility; signed out it does
  // not, so private owners' posts are excluded at the query level either way.
  const storyGroups = user ? await getStoryGroups(user.id) : [];

  const visibility = await visiblePostWhere(user?.id);

  const posts = await prisma.post.findMany({
    where: ownerIdFilter
      ? { AND: [{ ownerId: { in: ownerIdFilter } }, visibility] }
      : visibility,
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
        {user && storyGroups.length > 0 && <StoryTray groups={storyGroups} />}
        {isEmptyFollowingFeed && (
          <EmptyState icon="pawprint" title="Your feed is quiet">
            No posts yet from people you follow.{" "}
            <Link href="/explore" className="text-primary underline">
              Explore
            </Link>{" "}
            to find pets and owners to follow.
          </EmptyState>
        )}
        {!isFollowingFeed && posts.length === 0 && (
          <EmptyState icon="pawprint" title="No posts yet">
            Be the first to share something.
          </EmptyState>
        )}

        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={user?.id} />
          ))}
        </div>
      </div>
    </Shell>
  );
}
