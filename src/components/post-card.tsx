import Link from "next/link";
import Image from "next/image";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

type PostCardPost = {
  id: string;
  caption: string | null;
  mediaUrls: string[];
  createdAt: Date;
  owner: { username: string; displayName: string; isAnonymous: boolean };
  pet: { id: string; name: string; isAnonymous: boolean } | null;
  _count: { likes: number; comments: number };
};

export function PostCard({ post }: { post: PostCardPost }) {
  const hidden = post.pet ? post.pet.isAnonymous || post.owner.isAnonymous : post.owner.isAnonymous;
  const authorName = post.pet ? post.pet.name : post.owner.displayName;
  const authorLabel = hidden ? "Anonymous" : authorName;
  const authorHref = post.pet ? `/pets/${post.pet.id}` : `/owners/${post.owner.username}`;

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        {hidden ? (
          <div className="flex items-center gap-2">
            <Avatar name="?" size="sm" />
            <span className="text-sm font-medium">Anonymous</span>
          </div>
        ) : (
          <Link href={authorHref} className="flex items-center gap-2">
            <Avatar name={authorLabel} size="sm" />
            <span className="text-sm font-medium hover:underline">{authorLabel}</span>
          </Link>
        )}
        <span className="text-xs text-muted">{new Date(post.createdAt).toLocaleDateString()}</span>
      </div>

      {post.caption && <p className="text-sm">{post.caption}</p>}

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

      <Link href={`/posts/${post.id}`} className="text-sm text-muted hover:text-primary">
        {post._count.likes} likes · {post._count.comments} comments
      </Link>
    </Card>
  );
}
