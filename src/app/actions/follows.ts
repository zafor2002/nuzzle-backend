"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { notify, actorLabel } from "@/lib/notify";

export async function toggleFollow(targetOwnerId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (user.id === targetOwnerId) {
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
