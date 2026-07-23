import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { EditPetForm } from "./edit-pet-form";

export default async function EditPetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const pet = await prisma.pet.findUnique({ where: { id } });
  if (!pet) {
    notFound();
  }
  if (pet.ownerId !== user.id) {
    redirect(`/pets/${id}`);
  }

  return (
    <main className="mx-auto flex w-full min-h-[calc(100vh-65px)] max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Edit {pet.name}</h1>
      <Card>
        <EditPetForm
          petId={pet.id}
          ownerId={pet.ownerId}
          name={pet.name}
          species={pet.species}
          breed={pet.breed ?? ""}
          bio={pet.bio ?? ""}
          avatarUrl={pet.avatarUrl}
          isAnonymous={pet.isAnonymous}
        />
      </Card>
    </main>
  );
}
