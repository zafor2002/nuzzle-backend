"use server";

import { z } from "zod";
import { mediaUrlSchema } from "@/lib/media";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const createListingSchema = z.object({
  name: z.string().trim().min(1).max(60),
  species: z.string().trim().min(1).max(60),
  breed: z.string().trim().max(60).optional(),
  age: z.string().trim().max(40).optional(),
  gender: z.enum(["male", "female", "unknown"]).optional(),
  description: z.string().trim().min(1).max(2000),
  mediaUrl: mediaUrlSchema,
  location: z.string().trim().max(120).optional(),
  contactInfo: z.string().trim().max(200).optional(),
});

export async function createAdoptionListing(formData: FormData) {
  const user = await requireUser();

  if (!rateLimit(`adoption:${user.id}`, 10, 60 * 60 * 1000)) {
    return { error: "Too many listings created recently. Please try again later." };
  }

  const parsed = createListingSchema.safeParse({
    name: formData.get("name"),
    species: formData.get("species"),
    breed: formData.get("breed") || undefined,
    age: formData.get("age") || undefined,
    gender: formData.get("gender") || undefined,
    description: formData.get("description"),
    mediaUrl: formData.get("mediaUrl") || undefined,
    location: formData.get("location") || undefined,
    contactInfo: formData.get("contactInfo") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { name, species, breed, age, gender, description, mediaUrl, location, contactInfo } = parsed.data;

  const listing = await prisma.adoptionListing.create({
    data: {
      posterId: user.id,
      name,
      species,
      breed: breed || null,
      age: age || null,
      gender: gender || null,
      description,
      mediaUrls: mediaUrl ? [mediaUrl] : [],
      location: location || null,
      contactInfo: contactInfo || null,
    },
  });

  revalidatePath("/adoption");
  redirect(`/adoption/${listing.id}`);
}

const STATUSES = ["available", "pending", "adopted"] as const;

export async function updateListingStatus(id: string, status: (typeof STATUSES)[number]) {
  const user = await requireUser();

  if (!STATUSES.includes(status)) {
    return { error: "Invalid status." };
  }

  const listing = await prisma.adoptionListing.findFirst({ where: { id, posterId: user.id } });
  if (!listing) {
    return { error: "You can only update your own listings." };
  }

  await prisma.adoptionListing.update({ where: { id }, data: { status } });

  revalidatePath("/adoption");
  revalidatePath(`/adoption/${id}`);
}
