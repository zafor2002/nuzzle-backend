import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { HealthForm } from "./health-form";

export default async function NewHealthLogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const pet = await prisma.pet.findUnique({ where: { id } });
  if (!pet) {
    notFound();
  }
  if (pet.ownerId !== user.id) {
    redirect(`/pets/${id}`);
  }

  return (
    <main className="mx-auto flex w-full min-h-[calc(100vh-65px)] max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Add a health log for {pet.name}</h1>
      <Card>
        <HealthForm petId={pet.id} />
      </Card>
    </main>
  );
}
