"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const createHealthLogSchema = z.object({
  type: z.enum(["vaccination", "vet_visit", "medication", "other"]),
  title: z.string().trim().min(1).max(120),
  notes: z.string().trim().max(1000).optional(),
  date: z.coerce.date(),
  reminderAt: z.coerce.date().optional(),
});

export async function createHealthLog(petId: string, formData: FormData) {
  const user = await requireUser();

  if (!rateLimit(`health-log:${user.id}`, 30, 60 * 60 * 1000)) {
    return { error: "Too many entries created recently. Please try again later." };
  }

  const pet = await prisma.pet.findFirst({ where: { id: petId, ownerId: user.id } });
  if (!pet) {
    return { error: "You can only add health logs for your own pets." };
  }

  const parsed = createHealthLogSchema.safeParse({
    type: formData.get("type"),
    title: formData.get("title"),
    notes: formData.get("notes") || undefined,
    date: formData.get("date"),
    reminderAt: formData.get("reminderAt") || undefined,
  });

  if (!parsed.success) {
    return { error: "Type, title, and a valid date are required." };
  }
  const { type, title, notes, date, reminderAt } = parsed.data;

  await prisma.healthLog.create({
    data: {
      petId,
      type,
      title,
      notes: notes || null,
      date,
      reminderAt: reminderAt ?? null,
    },
  });

  revalidatePath(`/pets/${petId}`);
  redirect(`/pets/${petId}`);
}
