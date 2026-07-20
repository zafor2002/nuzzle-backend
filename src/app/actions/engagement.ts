"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { notify, actorLabel } from "@/lib/notify";

export async function toggleLike(postId: string) {
  const user = await requireUser();

  if (!rateLimit(`like:${user.id}`, 60, 60 * 1000)) {
    return;
  }

  const existing = await prisma.like.findUnique({
    where: { postId_ownerId: { postId, ownerId: user.id } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({ data: { postId, ownerId: user.id } });

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (post && post.ownerId !== user.id) {
      const label = await actorLabel(user.id);
      await notify(post.ownerId, "like", `${label} liked your post.`);
    }
  }

  revalidatePath(`/posts/${postId}`);
  revalidatePath("/feed");
}

const commentSchema = z.object({
  body: z.string().trim().min(1).max(1000),
});

export async function addComment(postId: string, formData: FormData) {
  const user = await requireUser();

  if (!rateLimit(`comment:${user.id}`, 20, 60 * 1000)) {
    return { error: "You're commenting too frequently. Please slow down." };
  }

  const parsed = commentSchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) {
    return { error: "Comment can't be empty." };
  }
  const { body } = parsed.data;

  await prisma.comment.create({
    data: { postId, ownerId: user.id, body },
  });

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (post && post.ownerId !== user.id) {
    const label = await actorLabel(user.id);
    await notify(post.ownerId, "comment", `${label} commented on your post.`);
  }

  revalidatePath(`/posts/${postId}`);
}
