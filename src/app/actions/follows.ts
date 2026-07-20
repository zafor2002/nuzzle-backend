"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { notify, actorLabel } from "@/lib/notify";

export async function toggleFollow(targetOwnerId: string) {
  const user = await requireUser();

  if (user.id === targetOwnerId) {
    return;
  }

  if (!rateLimit(`follow:${user.id}`, 60, 60 * 1000)) {
    return;
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: user.id, followingId: targetOwnerId } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
  } else {
    await prisma.follow.create({ data: { followerId: user.id, followingId: targetOwnerId } });
    const label = await actorLabel(user.id);
    await notify(targetOwnerId, "follow", `${label} started following you.`);
  }

  const target = await prisma.owner.findUnique({ where: { id: targetOwnerId } });
  if (target) {
    revalidatePath(`/owners/${target.username}`);
  }
  revalidatePath("/explore");
  revalidatePath("/feed");
}
