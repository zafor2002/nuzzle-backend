"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { mediaUrlSchema } from "@/lib/media";
import { extractHashtags } from "@/lib/hashtags";

const createReelSchema = z.object({
  videoUrl: mediaUrlSchema.unwrap(),
  caption: z.string().trim().max(500).optional(),
  petId: z.string().trim().optional(),
});

export async function createReel(formData: FormData) {
  const user = await requireUser();

  if (!rateLimit(`reel:${user.id}`, 10, 60 * 60 * 1000)) {
    return { error: "Too many reels posted recently. Please try again later." };
  }

  const parsed = createReelSchema.safeParse({
    videoUrl: formData.get("videoUrl"),
    caption: formData.get("caption") || undefined,
    petId: formData.get("petId") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { videoUrl, caption, petId } = parsed.data;

  if (petId) {
    const pet = await prisma.pet.findFirst({ where: { id: petId, ownerId: user.id } });
    if (!pet) {
      return { error: "You can only post as your own pet." };
    }
  }

  await prisma.reel.create({
    data: {
      ownerId: user.id,
      petId: petId || null,
      videoUrl,
      caption: caption || null,
    },
  });

  revalidatePath("/reels");
  for (const tag of extractHashtags(caption)) revalidatePath(`/hashtags/${tag}`);
  redirect("/reels");
}

export async function toggleReelLike(reelId: string) {
  const user = await requireUser();

  if (!rateLimit(`reel-like:${user.id}`, 60, 60 * 1000)) {
    return;
  }

  const existing = await prisma.reelLike.findUnique({
    where: { reelId_ownerId: { reelId, ownerId: user.id } },
  });

  if (existing) {
    await prisma.reelLike.delete({ where: { reelId_ownerId: { reelId, ownerId: user.id } } });
  } else {
    await prisma.reelLike.create({ data: { reelId, ownerId: user.id } });
  }

  revalidatePath("/reels");
}

export async function deleteReel(reelId: string) {
  const user = await requireUser();
  await prisma.reel.deleteMany({ where: { id: reelId, ownerId: user.id } });
  revalidatePath("/reels");
}
