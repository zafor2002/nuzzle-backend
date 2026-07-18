import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { PetForm } from "./pet-form";

export default async function NewPetPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Add a pet</h1>
      <PetForm />
    </main>
  );
}
