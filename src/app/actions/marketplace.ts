"use server";

import { z } from "zod";
import { mediaUrlSchema } from "@/lib/media";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const CATEGORIES = ["food", "toys", "beds", "health", "accessories", "other"] as const;

const createListingSchema = z.object({
  title: z.string().trim().min(1).max(100),
  category: z.enum(CATEGORIES),
  price: z.coerce.number().min(0).max(100000),
  description: z.string().trim().min(1).max(2000),
  mediaUrl: mediaUrlSchema,
  location: z.string().trim().max(120).optional(),
});

export async function createMarketplaceListing(formData: FormData) {
  const user = await requireUser();

  if (!rateLimit(`marketplace:${user.id}`, 10, 60 * 60 * 1000)) {
    return { error: "Too many listings created recently. Please try again later." };
  }

  const parsed = createListingSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    price: formData.get("price"),
    description: formData.get("description"),
    mediaUrl: formData.get("mediaUrl") || undefined,
    location: formData.get("location") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { title, category, price, description, mediaUrl, location } = parsed.data;

  const listing = await prisma.marketplaceListing.create({
    data: {
      sellerId: user.id,
      title,
      category,
      price,
      description,
      mediaUrls: mediaUrl ? [mediaUrl] : [],
      location: location || null,
    },
  });

  revalidatePath("/marketplace");
  redirect(`/marketplace/${listing.id}`);
}

export async function toggleListingSold(id: string) {
  const user = await requireUser();

  const listing = await prisma.marketplaceListing.findFirst({ where: { id, sellerId: user.id } });
  if (!listing) {
    return { error: "You can only update your own listings." };
  }

  await prisma.marketplaceListing.update({
    where: { id },
    data: { status: listing.status === "sold" ? "available" : "sold" },
  });

  revalidatePath("/marketplace");
  revalidatePath(`/marketplace/${id}`);
}
