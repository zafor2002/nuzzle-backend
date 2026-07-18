"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const caption = String(formData.get("caption") ?? "").trim();
  const mediaUrl = String(formData.get("mediaUrl") ?? "").trim();
  const petId = String(formData.get("petId") ?? "").trim();

  if (!caption && !mediaUrl) {
    return { error: "Add a caption or an image URL." };
  }

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
