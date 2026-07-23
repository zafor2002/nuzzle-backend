"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const messageSchema = z.object({
  body: z.string().trim().min(1).max(1000),
});

export async function sendMessage(receiverId: string, formData: FormData) {
  const user = await requireUser();

  if (user.id === receiverId) {
    return { error: "You can't message yourself." };
  }

  if (!rateLimit(`message:${user.id}`, 40, 60 * 1000)) {
    return { error: "You're sending messages too quickly. Please slow down." };
  }

  const parsed = messageSchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) {
    return { error: "Message can't be empty." };
  }

  const receiver = await prisma.owner.findUnique({ where: { id: receiverId } });
  if (!receiver) {
    return { error: "That person doesn't exist." };
  }

  await prisma.message.create({
    data: { senderId: user.id, receiverId, body: parsed.data.body },
  });

  revalidatePath(`/messages/${receiver.username}`);
  revalidatePath("/messages");
}
