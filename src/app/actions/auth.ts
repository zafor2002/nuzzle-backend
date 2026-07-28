"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const signupSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6).max(72),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
  displayName: z.string().trim().min(1).max(100),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(72),
});

export async function signup(formData: FormData) {
  const ip = await getClientIp();
  if (!rateLimit(`signup:${ip}`, 5, 60 * 60 * 1000)) {
    return { error: "Too many signup attempts. Please try again later." };
  }

  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    username: formData.get("username"),
    displayName: formData.get("displayName"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { email, password, username, displayName } = parsed.data;

  const existing = await prisma.owner.findUnique({ where: { username } });
  if (existing) {
    return { error: "That username is already taken." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message };
  }
  if (!data.user) {
    return { error: "Sign up failed — please try again." };
  }

  // The auth user exists by this point, so a failure here would otherwise throw
  // up the generic error boundary and leave an account that cannot be used.
  // Surface it as a form error instead; signing up again with the same email
  // reuses the existing auth user and retries this insert.
  try {
    await prisma.owner.create({
      data: {
        id: data.user.id,
        email,
        username,
        displayName,
      },
    });
  } catch (err) {
    const known = err as { code?: string };
    if (known.code === "P2002") {
      return { error: "That username or email is already registered. Try logging in." };
    }
    console.error("signup: failed to create owner profile", err);
    return { error: "Could not finish creating your profile. Please try again." };
  }

  if (!data.session) {
    // Email confirmation is required before a session exists.
    redirect("/signup/check-email");
  }

  redirect("/");
}

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Email and password are required." };
  }
  const { email, password } = parsed.data;

  if (!rateLimit(`login:${email}`, 8, 5 * 60 * 1000)) {
    return { error: "Too many login attempts. Please try again in a few minutes." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
