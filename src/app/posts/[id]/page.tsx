import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { VoteArrow } from "@/components/vote-arrow";
import { Shell } from "@/components/shell";
import { LeftSidebar } from "@/components/left-sidebar";
import { isHidden } from "@/lib/visibility";
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

  const hidden = isHidden(post.pet, post.owner);
  const authorName = post.pet ? post.pet.name : post.owner.displayName;
  const authorLabel = hidden ? "Anonymous" : authorName;
  const liked = user ? post.likes.some((l) => l.ownerId === user.id) : false;

  return (
    <Shell left={<LeftSidebar />}>
      <div className="flex flex-col gap-4">
        <Link href="/feed" className="text-sm text-muted hover:text-primary">
          &larr; Back to feed
        </Link>

        <Card className="flex gap-2 p-2">
          <VoteArrow postId={post.id} likeCount={post.likes.length} liked={liked} />

          <div className="flex min-w-0 flex-1 flex-col gap-2 py-1">
            <div className="flex flex-wrap items-center gap-1 text-xs text-muted">
              {post.pet && !hidden && (
                <>
                  <Link
                    href={`/communities/${encodeURIComponent(post.pet.species)}`}
                    className="font-medium text-foreground hover:underline"
                  >
                    🐾 {post.pet.species}
                  </Link>
                  <span>·</span>
                </>
              )}
              <span className="flex items-center gap-1">
                <Avatar name={authorLabel} size="sm" />
                {post.pet && !hidden ? (
                  <Link href={`/pets/${post.pet.id}`} className="hover:underline">
                    {authorLabel}
                  </Link>
                ) : (
                  authorLabel
                )}
              </span>
              <span>·</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
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
          </div>
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
      </div>
    </Shell>
  );
}
