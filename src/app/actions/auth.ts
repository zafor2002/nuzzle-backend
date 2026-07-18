"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export async function signup(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const username = String(formData.get("username")).trim().toLowerCase();
  const displayName = String(formData.get("displayName")).trim();

  if (!email || !password || !username || !displayName) {
    return { error: "All fields are required." };
  }

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

  await prisma.owner.create({
    data: {
      id: data.user.id,
      email,
      username,
      displayName,
    },
  });

  if (!data.session) {
    // Email confirmation is required before a session exists.
    redirect("/signup/check-email");
  }

  redirect("/");
}

export async function login(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  if (!email || !password) {
    return { error: "Email and password are required." };
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
