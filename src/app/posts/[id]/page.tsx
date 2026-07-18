import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
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
    <main className="mx-auto flex min-h-[calc(100vh-57px)] max-w-lg flex-col gap-4 p-6">
      <Link href="/feed" className="text-sm text-muted hover:text-primary">
        &larr; Back to feed
      </Link>

      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          {post.pet && !hidden ? (
            <Link href={`/pets/${post.pet.id}`} className="flex items-center gap-2">
              <Avatar name={authorLabel} size="sm" />
              <span className="text-sm font-medium hover:underline">{authorLabel}</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Avatar name={authorLabel} size="sm" />
              <span className="text-sm font-medium">{authorLabel}</span>
            </div>
          )}
          <span className="text-xs text-muted">{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>

        {post.caption && <p>{post.caption}</p>}

        {post.mediaUrls[0] && (
          <Image
            src={post.mediaUrls[0]}
            alt=""
            width={600}
            height={400}
            unoptimized
            className="w-full rounded-md object-cover"
          />
        )}

        <LikeButton postId={post.id} likeCount={post.likes.length} liked={liked} />
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">Comments ({post.comments.length})</h2>

        {post.comments.map((comment) => (
          <div key={comment.id} className="flex items-start gap-2 rounded-md border border-border px-3 py-2 text-sm">
            <Avatar name={comment.owner.isAnonymous ? "?" : comment.owner.displayName} size="sm" />
            <p>
              <span className="font-medium">
                {comment.owner.isAnonymous ? "Anonymous" : comment.owner.displayName}
              </span>{" "}
              {comment.body}
            </p>
          </div>
        ))}

        {user ? (
          <CommentForm postId={post.id} />
        ) : (
          <p className="text-sm text-muted">
            <Link href="/login" className="text-primary underline">
              Log in
            </Link>{" "}
            to comment.
          </p>
        )}
      </section>
    </main>
  );
}
