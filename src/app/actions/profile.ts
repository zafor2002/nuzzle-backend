"use server";

import { z } from "zod";
import { mediaUrlSchema } from "@/lib/media";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const updateOwnerSchema = z.object({
  displayName: z.string().trim().min(1).max(100),
  bio: z.string().trim().max(500).optional(),
  avatarUrl: mediaUrlSchema,
  isAnonymous: z.boolean(),
});

export async function updateOwnerProfile(formData: FormData) {
  const user = await requireUser();

  if (!rateLimit(`update-owner:${user.id}`, 20, 60 * 60 * 1000)) {
    return { error: "Too many profile updates recently. Please try again later." };
  }

  const parsed = updateOwnerSchema.safeParse({
    displayName: formData.get("displayName"),
    bio: formData.get("bio") || undefined,
    avatarUrl: formData.get("avatarUrl") || undefined,
    isAnonymous: formData.get("isAnonymous") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { displayName, bio, avatarUrl, isAnonymous } = parsed.data;

  const owner = await prisma.owner.update({
    where: { id: user.id },
    data: {
      displayName,
      bio: bio || null,
      ...(avatarUrl ? { avatarUrl } : {}),
      isAnonymous,
    },
  });

  revalidatePath(`/owners/${owner.username}`);
  redirect(`/owners/${owner.username}`);
}

const updatePetSchema = z.object({
  name: z.string().trim().min(1).max(60),
  species: z.string().trim().min(1).max(60),
  breed: z.string().trim().max(60).optional(),
  bio: z.string().trim().max(500).optional(),
  avatarUrl: mediaUrlSchema,
  isAnonymous: z.boolean(),
});

export async function updatePet(petId: string, formData: FormData) {
  const user = await requireUser();

  const existing = await prisma.pet.findFirst({ where: { id: petId, ownerId: user.id } });
  if (!existing) {
    return { error: "You can only edit your own pets." };
  }

  if (!rateLimit(`update-pet:${user.id}`, 30, 60 * 60 * 1000)) {
    return { error: "Too many updates recently. Please try again later." };
  }

  const parsed = updatePetSchema.safeParse({
    name: formData.get("name"),
    species: formData.get("species"),
    breed: formData.get("breed") || undefined,
    bio: formData.get("bio") || undefined,
    avatarUrl: formData.get("avatarUrl") || undefined,
    isAnonymous: formData.get("isAnonymous") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { name, species, breed, bio, avatarUrl, isAnonymous } = parsed.data;

  await prisma.pet.update({
    where: { id: petId },
    data: {
      name,
      species,
      breed: breed || null,
      bio: bio || null,
      ...(avatarUrl ? { avatarUrl } : {}),
      isAnonymous,
    },
  });

  revalidatePath(`/pets/${petId}`);
  redirect(`/pets/${petId}`);
}
