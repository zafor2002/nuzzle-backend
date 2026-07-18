import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { LikeButton } from "./like-button";
import { CommentForm } from "./comment-form";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      owner: true,
      pet: true,
      likes: true,
      comments: { include: { owner: true }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!post) {
    notFound();
  }

  const hidden = post.pet ? post.pet.isAnonymous || post.owner.isAnonymous : post.owner.isAnonymous;
  const authorName = post.pet ? post.pet.name : post.owner.displayName;
  const authorLabel = hidden ? "Anonymous" : authorName;
  const liked = user ? post.likes.some((l) => l.ownerId === user.id) : false;

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-4 p-6">
      <Link href="/feed" className="text-sm underline">
        &larr; Back to feed
      </Link>

      <article className="flex flex-col gap-2 rounded border p-4">
        <div className="flex items-center justify-between text-sm">
          {post.pet && !hidden ? (
            <Link href={`/pets/${post.pet.id}`} className="font-medium underline">
              {authorLabel}
            </Link>
          ) : (
            <span className="font-medium">{authorLabel}</span>
          )}
          <span className="text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</span>
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

        <LikeButton postId={post.id} likeCount={post.likes.length} liked={liked} />
      </article>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">Comments ({post.comments.length})</h2>

        {post.comments.map((comment) => (
          <div key={comment.id} className="rounded border px-3 py-2 text-sm">
            <span className="font-medium">
              {comment.owner.isAnonymous ? "Anonymous" : comment.owner.displayName}:{" "}
            </span>
            {comment.body}
          </div>
        ))}

        {user ? (
          <CommentForm postId={post.id} />
        ) : (
          <p className="text-sm text-gray-500">
            <Link href="/login" className="underline">
              Log in
            </Link>{" "}
            to comment.
          </p>
        )}
      </section>
    </main>
  );
}
