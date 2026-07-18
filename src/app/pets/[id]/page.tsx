import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function PetProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const pet = await prisma.pet.findUnique({
    where: { id },
    include: { owner: true },
  });

  if (!pet) {
    notFound();
  }

  const ownerIsHidden = pet.isAnonymous || pet.owner.isAnonymous;

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-4 p-6">
      <Link href="/" className="text-sm underline">
        &larr; Back
      </Link>

      <h1 className="text-3xl font-semibold">{pet.name}</h1>
      <p className="text-gray-600">
        {pet.species}
        {pet.breed ? ` · ${pet.breed}` : ""}
      </p>

      {pet.bio && <p>{pet.bio}</p>}

      <p className="text-sm text-gray-500">
        {ownerIsHidden ? (
          "Managed by an anonymous owner"
        ) : (
          <>
            Owned by{" "}
            <Link href={`/owners/${pet.owner.username}`} className="underline">
              {pet.owner.displayName}
            </Link>
          </>
        )}
      </p>
    </main>
  );
}
