import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { ResolveButton } from "./resolve-button";

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
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Lost & Found</h1>
        <Link href="/lost-found/new" className="rounded bg-black px-3 py-2 text-sm text-white">
          Report a pet
        </Link>
      </div>

      {posts.length === 0 && <p className="text-gray-500">No active reports right now.</p>}

      <div className="flex flex-col gap-4">
        {posts.map((post) => {
          const hidden = post.pet ? post.pet.isAnonymous || post.owner.isAnonymous : post.owner.isAnonymous;
          const authorLabel = hidden ? "Anonymous" : post.owner.displayName;
          const isMine = user?.id === post.ownerId;

          return (
            <article key={post.id} className="flex flex-col gap-2 rounded border p-4">
              <div className="flex items-center justify-between text-sm">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium uppercase ${
                    post.status === "lost" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                  }`}
                >
                  {post.status}
                </span>
                <span className="text-gray-400">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>

              {post.pet && (
                <Link href={`/pets/${post.pet.id}`} className="font-medium underline">
                  {post.pet.name}
                </Link>
              )}

              <p>{post.description}</p>

              {post.contactInfo && (
                <p className="text-sm text-gray-600">Contact: {post.contactInfo}</p>
              )}

              <p className="text-sm text-gray-500">Reported by {authorLabel}</p>

              {isMine && <ResolveButton id={post.id} />}
            </article>
          );
        })}
      </div>
    </main>
  );
}
