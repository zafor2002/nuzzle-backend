"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "@/app/actions/auth";

const initialState = { error: "" };

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    const result = await signup(formData);
    return result ?? initialState;
  }, initialState);

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Create your PetSocial account</h1>

      <form action={formAction} className="flex flex-col gap-4">
        <input
          name="displayName"
          type="text"
          placeholder="Your name"
          required
          className="rounded border px-3 py-2"
        />
        <input
          name="username"
          type="text"
          placeholder="Username"
          required
          className="rounded border px-3 py-2"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="rounded border px-3 py-2"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          minLength={6}
          className="rounded border px-3 py-2"
        />

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
        >
          {pending ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <p className="text-sm">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
