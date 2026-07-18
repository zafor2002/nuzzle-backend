"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export async function createPet(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = String(formData.get("name")).trim();
  const species = String(formData.get("species")).trim();
  const breed = String(formData.get("breed") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const isAnonymous = formData.get("isAnonymous") === "on";

  if (!name || !species) {
    return { error: "Name and species are required." };
  }

  const pet = await prisma.pet.create({
    data: {
      ownerId: user.id,
      name,
      species,
      breed: breed || null,
      bio: bio || null,
      isAnonymous,
    },
  });

  redirect(`/pets/${pet.id}`);
}
