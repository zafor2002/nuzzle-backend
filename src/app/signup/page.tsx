"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const initialState = { error: "" };

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    const result = await signup(formData);
    return result ?? initialState;
  }, initialState);

  return (
    <main className="mx-auto flex w-full min-h-[calc(100vh-97px)] max-w-sm flex-col justify-center gap-6 p-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">🐾 Join PetSocial</h1>
        <p className="mt-1 text-sm text-muted">Create an account for you and your pets</p>
      </div>

      <Card>
        <form action={formAction} className="flex flex-col gap-4">
          <Input name="displayName" type="text" placeholder="Your name" required />
          <Input name="username" type="text" placeholder="Username" required />
          <Input name="email" type="email" placeholder="Email" required />
          <Input name="password" type="password" placeholder="Password" required minLength={6} />

          {state.error && <p className="text-sm text-danger">{state.error}</p>}

          <Button type="submit" disabled={pending}>
            {pending ? "Creating account..." : "Sign up"}
          </Button>
        </form>
      </Card>

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-primary underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
