"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const createLostFoundSchema = z.object({
  status: z.enum(["lost", "found"]),
  petId: z.string().trim().max(100).optional(),
  description: z.string().trim().min(1).max(2000),
  contactInfo: z.string().trim().max(200).optional(),
});

export async function createLostFoundPost(formData: FormData) {
  const user = await requireUser();

  if (!rateLimit(`lost-found:${user.id}`, 10, 60 * 60 * 1000)) {
    return { error: "Too many reports created recently. Please try again later." };
  }

  const parsed = createLostFoundSchema.safeParse({
    status: formData.get("status") ?? "lost",
    petId: formData.get("petId") || undefined,
    description: formData.get("description"),
    contactInfo: formData.get("contactInfo") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { status, petId, description, contactInfo } = parsed.data;

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
  const user = await requireUser();

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
