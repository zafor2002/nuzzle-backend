"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const createPetSchema = z.object({
  name: z.string().trim().min(1).max(60),
  species: z.string().trim().min(1).max(60),
  breed: z.string().trim().max(60).optional(),
  bio: z.string().trim().max(500).optional(),
  isAnonymous: z.boolean(),
});

export async function createPet(formData: FormData) {
  const user = await requireUser();

  if (!rateLimit(`create-pet:${user.id}`, 10, 60 * 60 * 1000)) {
    return { error: "Too many pets created recently. Please try again later." };
  }

  const parsed = createPetSchema.safeParse({
    name: formData.get("name"),
    species: formData.get("species"),
    breed: formData.get("breed") || undefined,
    bio: formData.get("bio") || undefined,
    isAnonymous: formData.get("isAnonymous") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { name, species, breed, bio, isAnonymous } = parsed.data;

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
