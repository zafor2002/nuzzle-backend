"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { mediaUrlSchema } from "@/lib/media";
import { STORY_TTL_HOURS } from "@/lib/stories";

const createStorySchema = z.object({
  mediaUrl: z.string().trim().url().max(2000),
  caption: z.string().trim().max(300).optional(),
  petId: z.string().trim().optional(),
});

export async function createStory(formData: FormData) {
  const user = await requireUser();

  if (!rateLimit(`story:${user.id}`, 20, 60 * 60 * 1000)) {
    return { error: "Too many stories posted recently. Please try again later." };
  }

  const parsed = createStorySchema
    .extend({ mediaUrl: mediaUrlSchema.unwrap() })
    .safeParse({
      mediaUrl: formData.get("mediaUrl"),
      caption: formData.get("caption") || undefined,
      petId: formData.get("petId") || undefined,
    });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { mediaUrl, caption, petId } = parsed.data;

  if (petId) {
    const pet = await prisma.pet.findFirst({ where: { id: petId, ownerId: user.id } });
    if (!pet) {
      return { error: "You can only post as your own pet." };
    }
  }

  await prisma.story.create({
    data: {
      ownerId: user.id,
      petId: petId || null,
      mediaUrl,
      caption: caption || null,
      expiresAt: new Date(Date.now() + STORY_TTL_HOURS * 60 * 60 * 1000),
    },
  });

  revalidatePath("/feed");
  redirect("/feed");
}

/** Records that the signed-in viewer has seen a story. Idempotent. */
export async function markStorySeen(storyId: string) {
  const user = await requireUser();

  // Only for stories that are still live, so expired rows are not resurrected.
  const story = await prisma.story.findFirst({
    where: { id: storyId, expiresAt: { gt: new Date() } },
    select: { id: true },
  });
  if (!story) return;

  await prisma.storyView.upsert({
    where: { storyId_viewerId: { storyId, viewerId: user.id } },
    create: { storyId, viewerId: user.id },
    update: {},
  });

  revalidatePath("/feed");
}

export async function deleteStory(storyId: string) {
  const user = await requireUser();
  // Scoped delete: ownership is part of the query, never checked afterwards.
  await prisma.story.deleteMany({ where: { id: storyId, ownerId: user.id } });
  revalidatePath("/feed");
}
