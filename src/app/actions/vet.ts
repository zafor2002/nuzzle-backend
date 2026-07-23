"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const bookingSchema = z.object({
  petId: z.string().trim().min(1),
  reason: z.string().trim().min(1).max(120),
  notes: z.string().trim().max(1000).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date."),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time."),
});

export async function bookAppointment(vetId: string, formData: FormData) {
  const user = await requireUser();

  if (!rateLimit(`book-vet:${user.id}`, 10, 60 * 60 * 1000)) {
    return { error: "Too many booking attempts. Please try again later." };
  }

  const parsed = bookingSchema.safeParse({
    petId: formData.get("petId"),
    reason: formData.get("reason"),
    notes: formData.get("notes") || undefined,
    date: formData.get("date"),
    time: formData.get("time"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { petId, reason, notes, date, time } = parsed.data;

  const pet = await prisma.pet.findFirst({ where: { id: petId, ownerId: user.id } });
  if (!pet) {
    return { error: "You can only book appointments for your own pets." };
  }

  const vet = await prisma.vet.findUnique({ where: { id: vetId } });
  if (!vet) {
    return { error: "That vet doesn't exist." };
  }

  const scheduledAt = new Date(`${date}T${time}:00`);
  if (Number.isNaN(scheduledAt.getTime()) || scheduledAt < new Date()) {
    return { error: "Please pick a valid, upcoming time." };
  }

  const conflict = await prisma.appointment.findFirst({
    where: { vetId, scheduledAt, status: "confirmed" },
  });
  if (conflict) {
    return { error: "That slot was just booked. Please pick another time." };
  }

  await prisma.appointment.create({
    data: { ownerId: user.id, petId, vetId, reason, notes: notes || null, scheduledAt },
  });

  revalidatePath("/vet/appointments");
  redirect("/vet/appointments");
}

export async function cancelAppointment(id: string) {
  const user = await requireUser();

  const appt = await prisma.appointment.findFirst({ where: { id, ownerId: user.id } });
  if (!appt) {
    return { error: "Appointment not found." };
  }

  await prisma.appointment.update({ where: { id }, data: { status: "cancelled" } });
  revalidatePath("/vet/appointments");
}
