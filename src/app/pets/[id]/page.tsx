import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
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

      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3.5">
          <Avatar name={pet.name} src={pet.avatarUrl} size="xl" />
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold">{pet.name}</h1>
            <p className="mt-0.5 truncate text-[11.5px] text-muted">
              {ownerIsHidden ? (
                "Anonymous owner"
              ) : (
                <>
                  owned by{" "}
                  <Link href={`/owners/${pet.owner.username}`} className="font-bold text-primary">
                    @{pet.owner.username}
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
        {isOwner && (
          <Link href={`/pets/${pet.id}/edit`}>
            <Button variant="secondary" size="sm">
              Edit
            </Button>
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="info">{pet.species}</Badge>
        {pet.breed && <Badge variant="muted">{pet.breed}</Badge>}
        {pet.isAnonymous && <Badge variant="muted">anonymous</Badge>}
      </div>

      {pet.bio && <p className="text-sm leading-relaxed">{pet.bio}</p>}

      {isOwner && (
        <div className="flex gap-2.5">
          <Link href={`/pets/${pet.id}/health/new`} className="flex-1">
            <Button variant="secondary" size="sm" className="w-full">
              <Icon name="cross" className="h-4 w-4" /> Add health entry
            </Button>
          </Link>
          <Link href="/vet" className="flex-1">
            <Button variant="secondary" size="sm" className="w-full">
              <Icon name="calendar" className="h-4 w-4" /> Book a vet
            </Button>
          </Link>
        </div>
      )}

      {isOwner && (
        <section className="flex flex-col gap-2.5 border-t border-border pt-4">
          <h2 className="text-[13px] font-bold text-muted">Health log</h2>

          <Card
            padded={false}
            className="flex items-center gap-2.5 border-[#F7DCC8] bg-[#FEF3EB] p-3.5"
          >
            <Icon name="cross" className="h-5 w-5 shrink-0 text-primary" />
            <p className="text-[11.5px] leading-relaxed">
              Only you can see this. Health records never appear on the public profile.
            </p>
          </Card>

          {healthLogs.length === 0 && (
            <EmptyState icon="cross" title="No entries yet">
              Track vaccines, medication, weight and vet visits here.
            </EmptyState>
          )}

          {healthLogs.map((log) => (
            <Card key={log.id} padded={false} className="p-3.5">
              <div className="mb-1.5 flex items-center gap-2">
                <Badge variant="muted">{log.type.replace("_", " ")}</Badge>
                <span className="ml-auto shrink-0 text-[11.5px] text-muted">
                  {new Date(log.date).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm font-bold">{log.title}</p>
              {log.notes && <p className="mt-1 text-[11.5px] leading-relaxed text-muted">{log.notes}</p>}
              {log.reminderAt && (
                <p className="mt-1.5 text-[11.5px] font-semibold text-primary">
                  Reminder: {new Date(log.reminderAt).toLocaleDateString()}
                </p>
              )}
            </Card>
          ))}
        </section>
      )}
    </main>
  );
}
