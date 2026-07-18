import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PostCard } from "@/components/post-card";

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
    <main className="mx-auto flex w-full min-h-[calc(100vh-97px)] max-w-lg flex-col gap-6 p-6">
      <Link href="/communities" className="text-sm text-muted hover:text-primary">
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
            className={`rounded-full border border-border px-3 py-1 ${!breed ? "bg-primary text-primary-foreground" : "hover:bg-muted-bg"}`}
          >
            All
          </Link>
          {breeds.map((b) => (
            <Link
              key={b}
              href={`/communities/${encodeURIComponent(species)}?breed=${encodeURIComponent(b)}`}
              className={`rounded-full border border-border px-3 py-1 ${breed === b ? "bg-primary text-primary-foreground" : "hover:bg-muted-bg"}`}
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
            <Link key={pet.id} href={`/pets/${pet.id}`}>
              <Card className="flex items-center gap-3 transition-colors hover:bg-muted-bg">
                <Avatar name={pet.name} size="sm" />
                <span>
                  {pet.name}
                  {pet.breed && <span className="text-sm text-muted"> · {pet.breed}</span>}
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-medium">Recent posts</h2>
        {posts.length === 0 && <EmptyState>No posts yet.</EmptyState>}
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </section>
    </main>
  );
}
