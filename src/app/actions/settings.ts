"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { createClient } from "@/utils/supabase/server";

const privacySchema = z.object({
  isPrivate: z.boolean(),
  isAnonymous: z.boolean(),
});

export async function updatePrivacySettings(formData: FormData) {
  const user = await requireUser();

  if (!rateLimit(`settings-privacy:${user.id}`, 30, 60 * 60 * 1000)) {
    return { error: "Too many changes recently. Please try again later." };
  }

  const parsed = privacySchema.safeParse({
    isPrivate: formData.get("isPrivate") === "on",
    isAnonymous: formData.get("isAnonymous") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const owner = await prisma.owner.update({
    where: { id: user.id },
    data: parsed.data,
    select: { username: true },
  });

  // Anonymity and privacy change what other people are allowed to see, so the
  // cached renders of every surface that shows an owner have to go, not just
  // this screen.
  revalidatePath("/", "layout");
  revalidatePath(`/owners/${owner.username}`);
  return { ok: true, error: "" };
}

const notificationsSchema = z.object({
  notifyLikes: z.boolean(),
  notifyComments: z.boolean(),
  notifyFollows: z.boolean(),
});

export async function updateNotificationSettings(formData: FormData) {
  const user = await requireUser();

  if (!rateLimit(`settings-notifications:${user.id}`, 30, 60 * 60 * 1000)) {
    return { error: "Too many changes recently. Please try again later." };
  }

  const parsed = notificationsSchema.safeParse({
    notifyLikes: formData.get("notifyLikes") === "on",
    notifyComments: formData.get("notifyComments") === "on",
    notifyFollows: formData.get("notifyFollows") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.owner.update({ where: { id: user.id }, data: parsed.data });

  revalidatePath("/settings/notifications");
  return { ok: true, error: "" };
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z.string().min(6, "New password must be at least 6 characters.").max(72),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "The new passwords do not match.",
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    message: "The new password must be different from the current one.",
  });

export async function changePassword(formData: FormData) {
  const user = await requireUser();

  // Tighter than the other settings: this is the one that matters if a session
  // is ever left open on a shared device.
  if (!rateLimit(`change-password:${user.id}`, 5, 15 * 60 * 1000)) {
    return { error: "Too many password attempts. Please try again in a few minutes." };
  }

  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  // Supabase lets an authenticated user set a new password without proving the
  // old one. Re-authenticating first means someone who walks up to an unlocked
  // phone cannot take the account over.
  const owner = await prisma.owner.findUnique({
    where: { id: user.id },
    select: { email: true },
  });
  if (!owner) {
    return { error: "Could not load your account. Please try again." };
  }

  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: owner.email,
    password: parsed.data.currentPassword,
  });
  if (reauthError) {
    return { error: "Your current password is not correct." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.newPassword });
  if (error) {
    return { error: error.message };
  }

  return { ok: true, error: "" };
}
