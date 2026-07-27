import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { LikeButton } from "@/components/like-button";
import { Icon } from "@/components/ui/icon";
import { isHidden } from "@/lib/visibility";

type PostCardPost = {
  id: string;
  caption: string | null;
  mediaUrls: string[];
  createdAt: Date;
  owner: { username: string; displayName: string; isAnonymous: boolean; avatarUrl: string | null };
  pet: {
    id: string;
    name: string;
    species: string;
    breed: string | null;
    isAnonymous: boolean;
    avatarUrl: string | null;
  } | null;
  _count: { likes: number; comments: number };
  likes: { ownerId: string }[];
};

export function PostCard({ post, currentUserId }: { post: PostCardPost; currentUserId?: string }) {
  const hidden = isHidden(post.pet, post.owner);
  const authorName = post.pet ? post.pet.name : post.owner.displayName;
  const authorLabel = hidden ? "Anonymous" : authorName;
  const authorHref = post.pet ? `/pets/${post.pet.id}` : `/owners/${post.owner.username}`;
  const avatarUrl = hidden ? null : post.pet ? post.pet.avatarUrl : post.owner.avatarUrl;
  const liked = currentUserId ? post.likes.some((l) => l.ownerId === currentUserId) : false;

  // "Golden Retriever · 12/06/2026" — breed when we have it, species otherwise.
  const meta = [
    post.pet && !hidden ? post.pet.breed || post.pet.species : null,
    new Date(post.createdAt).toLocaleDateString(),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="flex items-center gap-2.5 px-3.5 py-3">
        {hidden ? (
          <Avatar name="Anonymous" src={null} />
        ) : (
          <Link href={authorHref}>
            <Avatar name={authorLabel} src={avatarUrl} />
          </Link>
        )}

        <div className="min-w-0 flex-1">
          <div className="truncate text-[14.5px] font-bold">
            {hidden ? (
              authorLabel
            ) : (
              <Link href={authorHref} className="hover:underline">
                {authorLabel}
              </Link>
            )}
          </div>
          <div className="truncate text-[11.5px] text-muted">{meta}</div>
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
        <Link href={`/posts/${post.id}`} className="block">
          <Image
            src={post.mediaUrls[0]}
            alt=""
            width={600}
            height={600}
            unoptimized
            className="max-h-[420px] w-full object-cover"
          />
        </Link>
      )}

      <div className="flex items-center gap-1.5 px-2.5 py-2.5">
        <LikeButton postId={post.id} likeCount={post._count.likes} liked={liked} />
        <Link
          href={`/posts/${post.id}`}
          className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[13px] font-semibold text-muted transition-colors hover:bg-muted-bg"
        >
          <Icon name="comment" className="h-5 w-5" /> {post._count.comments}
        </Link>
      </div>

      {post.caption && (
        <p className="px-3.5 pb-3.5 text-sm leading-relaxed">
          <span className="font-bold">{authorLabel}</span> {post.caption}
        </p>
      )}
    </Card>
  );
}
