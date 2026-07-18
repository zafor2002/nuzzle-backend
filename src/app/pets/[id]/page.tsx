import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export default async function PetProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pet = await prisma.pet.findUnique({
    where: { id },
    include: { owner: true },
  });

  if (!pet) {
    notFound();
  }

  const isOwner = user?.id === pet.ownerId;
  const ownerIsHidden = pet.isAnonymous || pet.owner.isAnonymous;

  const healthLogs = isOwner
    ? await prisma.healthLog.findMany({ where: { petId: pet.id }, orderBy: { date: "desc" } })
    : [];

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

      {isOwner && (
        <section className="flex flex-col gap-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Health log</h2>
            <Link
              href={`/pets/${pet.id}/health/new`}
              className="rounded bg-black px-3 py-1.5 text-sm text-white"
            >
              Add entry
            </Link>
          </div>

          {healthLogs.length === 0 && (
            <p className="text-sm text-gray-500">No health logs yet.</p>
          )}

          {healthLogs.map((log) => (
            <div key={log.id} className="rounded border px-3 py-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">{log.title}</span>
                <span className="text-gray-400">{new Date(log.date).toLocaleDateString()}</span>
              </div>
              <p className="text-xs uppercase text-gray-500">{log.type.replace("_", " ")}</p>
              {log.notes && <p className="mt-1">{log.notes}</p>}
              {log.reminderAt && (
                <p className="mt-1 text-xs text-amber-600">
                  Reminder: {new Date(log.reminderAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
