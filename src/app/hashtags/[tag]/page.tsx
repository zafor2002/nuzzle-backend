import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { visiblePostWhere } from "@/lib/privacy";
import { PostCard } from "@/components/post-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Shell } from "@/components/shell";

export default async function HashtagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag).toLowerCase();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const posts = await prisma.post.findMany({
    where: {
      AND: [{ hashtags: { some: { hashtag: { tag } } } }, await visiblePostWhere(user?.id)],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      owner: true,
      pet: true,
      _count: { select: { likes: true, comments: true } },
      likes: { where: { ownerId: user?.id ?? "__none__" }, select: { ownerId: true } },
    },
  });

  return (
    <Shell>
      <div className="flex flex-col gap-4">
        <PageHeader title={`#${tag}`} back="/explore" />

        <p className="-mt-2 text-[12.5px] text-muted">
          {posts.length === 0
            ? "No posts yet"
            : `${posts.length} ${posts.length === 1 ? "post" : "posts"}`}
        </p>

        {posts.length === 0 ? (
          <EmptyState icon="search" title={`Nothing tagged #${tag}`}>
            Add the tag to a caption and your post will show up here.
          </EmptyState>
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} currentUserId={user?.id} />
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
