"use server";

import { z } from "zod";
import { mediaUrlSchema } from "@/lib/media";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const createPostSchema = z
  .object({
    caption: z.string().trim().max(2000).optional(),
    mediaUrl: mediaUrlSchema.or(z.literal("")),
    petId: z.string().trim().max(100).optional(),
  })
  .refine((data) => data.caption || data.mediaUrl, {
    message: "Add a caption or an image URL.",
  });

export async function createPost(formData: FormData) {
  const user = await requireUser();

  if (!rateLimit(`create-post:${user.id}`, 20, 60 * 60 * 1000)) {
    return { error: "You're posting too frequently. Please slow down." };
  }

  const parsed = createPostSchema.safeParse({
    caption: formData.get("caption") || undefined,
    mediaUrl: formData.get("mediaUrl") || undefined,
    petId: formData.get("petId") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { caption, mediaUrl, petId } = parsed.data;

  if (petId) {
    const pet = await prisma.pet.findFirst({ where: { id: petId, ownerId: user.id } });
    if (!pet) {
      return { error: "You can only post as your own pet." };
    }
  }

  await prisma.post.create({
    data: {
      ownerId: user.id,
      petId: petId || null,
      caption: caption || null,
      mediaUrls: mediaUrl ? [mediaUrl] : [],
    },
  });

  revalidatePath("/feed");
  redirect("/feed");
}
