import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function CommunityPage({
  params,
  searchParams,
}: {
  params: Promise<{ species: string }>;
  searchParams: Promise<{ breed?: string }>;
}) {
  const { species: rawSpecies } = await params;
  const species = decodeURIComponent(rawSpecies);
  const { breed } = await searchParams;

  const pets = await prisma.pet.findMany({
    where: { species, ...(breed ? { breed } : {}) },
    orderBy: { createdAt: "desc" },
  });

  if (pets.length === 0 && !breed) {
    notFound();
  }

  const allPetsInSpecies = breed
    ? await prisma.pet.findMany({ where: { species }, select: { breed: true } })
    : pets.map((p) => ({ breed: p.breed }));
  const breeds = Array.from(
    new Set(allPetsInSpecies.map((p) => p.breed).filter((b): b is string => Boolean(b)))
  ).sort();

  const posts = await prisma.post.findMany({
    where: { pet: { species, ...(breed ? { breed } : {}) } },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { owner: true, pet: true, _count: { select: { likes: true, comments: true } } },
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 p-6">
      <Link href="/communities" className="text-sm underline">
        &larr; All communities
      </Link>

      <h1 className="text-2xl font-semibold">
        {species}
        {breed ? ` · ${breed}` : ""}
      </h1>

      {breeds.length > 0 && (
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href={`/communities/${encodeURIComponent(species)}`}
            className={`rounded-full border px-3 py-1 ${!breed ? "bg-black text-white" : ""}`}
          >
            All
          </Link>
          {breeds.map((b) => (
            <Link
              key={b}
              href={`/communities/${encodeURIComponent(species)}?breed=${encodeURIComponent(b)}`}
              className={`rounded-full border px-3 py-1 ${breed === b ? "bg-black text-white" : ""}`}
            >
              {b}
            </Link>
          ))}
        </div>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="font-medium">Pets ({pets.length})</h2>
        <div className="flex flex-col gap-2">
          {pets.map((pet) => (
            <Link key={pet.id} href={`/pets/${pet.id}`} className="rounded border px-4 py-2">
              {pet.name}
              {pet.breed && <span className="text-sm text-gray-500"> · {pet.breed}</span>}
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-medium">Recent posts</h2>
        {posts.length === 0 && <p className="text-sm text-gray-500">No posts yet.</p>}
        {posts.map((post) => {
          const hidden = post.pet ? post.pet.isAnonymous || post.owner.isAnonymous : false;
          const authorLabel = hidden ? "Anonymous" : post.pet?.name;

          return (
            <article key={post.id} className="flex flex-col gap-2 rounded border p-4">
              <div className="flex items-center justify-between text-sm">
                {!hidden && post.pet ? (
                  <Link href={`/pets/${post.pet.id}`} className="font-medium underline">
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
      </section>
    </main>
  );
}
