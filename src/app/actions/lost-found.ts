"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export async function createLostFoundPost(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const status = String(formData.get("status") ?? "lost");
  const petId = String(formData.get("petId") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const contactInfo = String(formData.get("contactInfo") ?? "").trim();

  if (status !== "lost" && status !== "found") {
    return { error: "Invalid status." };
  }
  if (!description) {
    return { error: "Description is required." };
  }

  if (petId) {
    const pet = await prisma.pet.findFirst({ where: { id: petId, ownerId: user.id } });
    if (!pet) {
      return { error: "You can only report your own pet." };
    }
  }

  await prisma.lostFoundPost.create({
    data: {
      ownerId: user.id,
      petId: petId || null,
      status,
      description,
      contactInfo: contactInfo || null,
    },
  });

  revalidatePath("/lost-found");
  redirect("/lost-found");
}

export async function markResolved(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const post = await prisma.lostFoundPost.findFirst({ where: { id, ownerId: user.id } });
  if (!post) {
    return;
  }

  await prisma.lostFoundPost.update({
    where: { id },
    data: { resolvedAt: new Date() },
  });

  revalidatePath("/lost-found");
}
