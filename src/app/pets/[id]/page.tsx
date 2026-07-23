import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { isHidden } from "@/lib/visibility";

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
  const ownerIsHidden = isHidden(pet, pet.owner);

  const healthLogs = isOwner
    ? await prisma.healthLog.findMany({ where: { petId: pet.id }, orderBy: { date: "desc" } })
    : [];

  return (
    <main className="mx-auto flex w-full min-h-[calc(100vh-65px)] max-w-lg flex-col gap-4 p-6">
      <Link href="/" className="text-sm text-muted hover:text-primary">
        &larr; Back
      </Link>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={pet.name} src={pet.avatarUrl} size="lg" />
          <div>
            <h1 className="text-2xl font-semibold">{pet.name}</h1>
            <p className="text-sm text-muted">
              {pet.species}
              {pet.breed ? ` · ${pet.breed}` : ""}
            </p>
          </div>
        </div>
        {isOwner && (
          <Link href={`/pets/${pet.id}/edit`}>
            <Button variant="secondary">Edit</Button>
          </Link>
        )}
      </div>

      {pet.bio && <p>{pet.bio}</p>}

      <p className="text-sm text-muted">
        {ownerIsHidden ? (
          "Managed by an anonymous owner"
        ) : (
          <>
            Owned by{" "}
            <Link href={`/owners/${pet.owner.username}`} className="text-primary underline">
              {pet.owner.displayName}
            </Link>
          </>
        )}
      </p>

      {isOwner && (
        <section className="flex flex-col gap-3 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Health log</h2>
            <Link href={`/pets/${pet.id}/health/new`}>
              <Button variant="secondary">Add entry</Button>
            </Link>
          </div>

          {healthLogs.length === 0 && <EmptyState>No health logs yet.</EmptyState>}

          {healthLogs.map((log) => (
            <div key={log.id} className="rounded-md border border-border px-3 py-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">{log.title}</span>
                <span className="text-xs text-muted">{new Date(log.date).toLocaleDateString()}</span>
              </div>
              <Badge variant="muted">{log.type.replace("_", " ")}</Badge>
              {log.notes && <p className="mt-1">{log.notes}</p>}
              {log.reminderAt && (
                <p className="mt-1 text-xs text-primary">
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
