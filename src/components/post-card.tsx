import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { VoteArrow } from "@/components/vote-arrow";
import { isHidden } from "@/lib/visibility";

type PostCardPost = {
  id: string;
  caption: string | null;
  mediaUrls: string[];
  createdAt: Date;
  owner: { username: string; displayName: string; isAnonymous: boolean };
  pet: { id: string; name: string; species: string; isAnonymous: boolean } | null;
  _count: { likes: number; comments: number };
  likes: { ownerId: string }[];
};

export function PostCard({ post, currentUserId }: { post: PostCardPost; currentUserId?: string }) {
  const hidden = isHidden(post.pet, post.owner);
  const authorName = post.pet ? post.pet.name : post.owner.displayName;
  const authorLabel = hidden ? "Anonymous" : authorName;
  const authorHref = post.pet ? `/pets/${post.pet.id}` : `/owners/${post.owner.username}`;
  const liked = currentUserId ? post.likes.some((l) => l.ownerId === currentUserId) : false;

  return (
    <Card className="flex gap-2 p-2">
      <VoteArrow postId={post.id} likeCount={post._count.likes} liked={liked} />

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 py-1">
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
          {hidden ? (
            <span>Posted by Anonymous</span>
          ) : (
            <span>
              Posted by{" "}
              <Link href={authorHref} className="hover:underline">
                {authorLabel}
              </Link>
            </span>
          )}
          <span>·</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>

        <Link href={`/posts/${post.id}`} className="block">
          {post.caption && <p className="font-medium leading-snug">{post.caption}</p>}

          {post.mediaUrls[0] && (
            <Image
              src={post.mediaUrls[0]}
              alt=""
              width={600}
              height={400}
              unoptimized
              className="mt-2 max-h-96 w-full rounded-md object-cover"
            />
          )}
        </Link>

        <Link
          href={`/posts/${post.id}`}
          className="mt-1 flex w-fit items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted hover:bg-muted-bg"
        >
          💬 {post._count.comments} comments
        </Link>
      </div>
    </Card>
  );
}
