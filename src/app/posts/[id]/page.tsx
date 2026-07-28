import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { LikeButton } from "@/components/like-button";
import { Icon } from "@/components/ui/icon";
import { CaptionText } from "@/components/caption-text";
import { canViewOwner } from "@/lib/privacy";
import { Shell } from "@/components/shell";
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

  // A direct link must not bypass privacy: 404 rather than reveal existence.
  if (!(await canViewOwner(post.owner, user?.id))) {
    notFound();
  }

  const hidden = isHidden(post.pet, post.owner);
  const authorName = post.pet ? post.pet.name : post.owner.displayName;
  const authorLabel = hidden ? "Anonymous" : authorName;
  const liked = user ? post.likes.some((l) => l.ownerId === user.id) : false;

  return (
    <Shell>
      <div className="flex flex-col gap-4">
        <Link href="/feed" className="text-sm text-muted hover:text-primary">
          &larr; Back to feed
        </Link>

        <Card padded={false} className="overflow-hidden">
          <div className="flex items-center gap-2.5 px-3.5 py-3">
            <Avatar
              name={authorLabel}
              src={hidden ? null : post.pet ? post.pet.avatarUrl : post.owner.avatarUrl}
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[14.5px] font-bold">
                {post.pet && !hidden ? (
                  <Link href={`/pets/${post.pet.id}`} className="hover:underline">
                    {authorLabel}
                  </Link>
                ) : (
                  authorLabel
                )}
              </div>
              <div className="truncate text-[11.5px] text-muted">
                {[
                  post.pet && !hidden ? post.pet.breed || post.pet.species : null,
                  new Date(post.createdAt).toLocaleDateString(),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            </div>
            {post.pet && !hidden && (
              <Link
                href={`/communities/${encodeURIComponent(post.pet.species)}`}
                className="shrink-0 rounded-full bg-muted-bg px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.04em] text-muted"
              >
                {post.pet.species}
              </Link>
            )}
          </div>

          {post.mediaUrls[0] && (
            <Image
              src={post.mediaUrls[0]}
              alt=""
              width={600}
              height={600}
              unoptimized
              className="max-h-[460px] w-full object-cover"
            />
          )}

          <div className="flex items-center gap-1.5 px-2.5 py-2.5">
            <LikeButton postId={post.id} likeCount={post.likes.length} liked={liked} />
            <span className="flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] font-semibold text-muted">
              <Icon name="comment" className="h-5 w-5" /> {post.comments.length}
            </span>
          </div>

          {post.caption && (
            <p className="px-3.5 pb-3.5 text-sm leading-relaxed">
              <span className="font-bold">{authorLabel}</span> <CaptionText caption={post.caption} />
            </p>
          )}
        </Card>

        <section className="flex flex-col gap-3">
          <h2 className="font-medium">Comments ({post.comments.length})</h2>

          {post.comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-2.5 text-sm">
              <Avatar
                name={comment.owner.isAnonymous ? "Anonymous" : comment.owner.displayName}
                src={comment.owner.isAnonymous ? null : comment.owner.avatarUrl}
                size="sm"
              />
              <p className="leading-relaxed">
                <span className="font-bold">
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
