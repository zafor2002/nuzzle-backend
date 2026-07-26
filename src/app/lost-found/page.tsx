import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ResolveButton } from "./resolve-button";
import { Shell } from "@/components/shell";
import { isHidden } from "@/lib/visibility";

export default async function LostFoundPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const posts = await prisma.lostFoundPost.findMany({
    where: { resolvedAt: null },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { owner: true, pet: true },
  });

  return (
    <Shell>
      <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Lost & Found</h1>
        <Link href="/lost-found/new">
          <Button>Report a pet</Button>
        </Link>
      </div>

      {posts.length === 0 && <EmptyState>No active reports right now.</EmptyState>}

      <div className="flex flex-col gap-4">
        {posts.map((post) => {
          const hidden = isHidden(post.pet, post.owner);
          const authorLabel = hidden ? "Anonymous" : post.owner.displayName;
          const isMine = user?.id === post.ownerId;

          return (
            <Card key={post.id} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Badge variant={post.status === "lost" ? "danger" : "success"}>{post.status}</Badge>
                <span className="text-xs text-muted">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>

              {post.pet && (
                <Link href={`/pets/${post.pet.id}`} className="font-medium text-primary underline">
                  {post.pet.name}
                </Link>
              )}

              <p>{post.description}</p>

              {post.contactInfo && (
                <p className="text-sm text-muted">Contact: {post.contactInfo}</p>
              )}

              <p className="text-sm text-muted">Reported by {authorLabel}</p>

              {isMine && <ResolveButton id={post.id} />}
            </Card>
          );
        })}
      </div>
      </div>
    </Shell>
  );
}
