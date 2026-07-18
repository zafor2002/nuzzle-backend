import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { LostFoundForm } from "./lost-found-form";

export default async function NewLostFoundPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const pets = await prisma.pet.findMany({
    where: { ownerId: user.id },
    select: { id: true, name: true },
  });

  return (
    <main className="mx-auto flex w-full min-h-[calc(100vh-97px)] max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Report a lost or found pet</h1>
      <Card>
        <LostFoundForm pets={pets} />
      </Card>
    </main>
  );
}
