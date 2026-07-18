import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

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
    include: { owner: true, pet: true, _count: { select: { likes: true, comments: true } } },
  });

  const isFollowingFeed = Boolean(ownerIdFilter);
  const isEmptyFollowingFeed = isFollowingFeed && posts.length === 0;

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Feed</h1>
        <div className="flex gap-2">
          <Link href="/explore" className="rounded border px-3 py-2 text-sm">
            Explore
          </Link>
          <Link href="/posts/new" className="rounded bg-black px-3 py-2 text-sm text-white">
            New post
          </Link>
        </div>
      </div>

      {isEmptyFollowingFeed && (
        <p className="text-gray-500">
          No posts yet from people you follow.{" "}
          <Link href="/explore" className="underline">
            Explore
          </Link>{" "}
          to find pets and owners to follow.
        </p>
      )}
      {!isFollowingFeed && posts.length === 0 && <p className="text-gray-500">No posts yet.</p>}

      <div className="flex flex-col gap-4">
        {posts.map((post) => {
          const hidden = post.pet ? post.pet.isAnonymous || post.owner.isAnonymous : post.owner.isAnonymous;
          const authorName = post.pet ? post.pet.name : post.owner.displayName;
          const authorLabel = hidden ? "Anonymous" : authorName;

          return (
            <article key={post.id} className="flex flex-col gap-2 rounded border p-4">
              <div className="flex items-center justify-between text-sm">
                {post.pet && !hidden ? (
                  <Link href={`/pets/${post.pet.id}`} className="font-medium underline">
                    {authorLabel}
                  </Link>
                ) : !post.pet && !hidden ? (
                  <Link href={`/owners/${post.owner.username}`} className="font-medium underline">
                    {authorLabel}
                  </Link>
                ) : (
                  <span className="font-medium">{authorLabel}</span>
                )}
                <span className="text-gray-400">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>

              {post.caption && <p>{post.caption}</p>}

              {post.mediaUrls[0] && (
                <Image
                  src={post.mediaUrls[0]}
                  alt=""
                  width={600}
                  height={400}
                  unoptimized
                  className="w-full rounded object-cover"
                />
              )}

              <Link href={`/posts/${post.id}`} className="text-sm text-gray-500 underline">
                {post._count.likes} likes · {post._count.comments} comments
              </Link>
            </article>
          );
        })}
      </div>
    </main>
  );
}
