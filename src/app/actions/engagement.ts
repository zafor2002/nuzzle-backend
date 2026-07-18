"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export async function toggleLike(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const existing = await prisma.like.findUnique({
    where: { postId_ownerId: { postId, ownerId: user.id } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({ data: { postId, ownerId: user.id } });
  }

  revalidatePath(`/posts/${postId}`);
  revalidatePath("/feed");
}

export async function addComment(postId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const body = String(formData.get("body") ?? "").trim();
  if (!body) {
    return { error: "Comment can't be empty." };
  }

  await prisma.comment.create({
    data: { postId, ownerId: user.id, body },
  });

  revalidatePath(`/posts/${postId}`);
}
