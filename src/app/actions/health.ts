"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export async function createHealthLog(petId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const pet = await prisma.pet.findFirst({ where: { id: petId, ownerId: user.id } });
  if (!pet) {
    return { error: "You can only add health logs for your own pets." };
  }

  const type = String(formData.get("type") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const reminderAt = String(formData.get("reminderAt") ?? "").trim();

  if (!type || !title || !date) {
    return { error: "Type, title, and date are required." };
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return { error: "Invalid date." };
  }

  const parsedReminder = reminderAt ? new Date(reminderAt) : null;
  if (parsedReminder && Number.isNaN(parsedReminder.getTime())) {
    return { error: "Invalid reminder date." };
  }

  await prisma.healthLog.create({
    data: {
      petId,
      type,
      title,
      notes: notes || null,
      date: parsedDate,
      reminderAt: parsedReminder,
    },
  });

  revalidatePath(`/pets/${petId}`);
  redirect(`/pets/${petId}`);
}
