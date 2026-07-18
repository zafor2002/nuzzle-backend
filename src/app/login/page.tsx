"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/app/actions/auth";

const initialState = { error: "" };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    const result = await login(formData);
    return result ?? initialState;
  }, initialState);

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Log in to PetSocial</h1>

      <form action={formAction} className="flex flex-col gap-4">
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
          className="rounded border px-3 py-2"
        />

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
        >
          {pending ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="underline">
          Sign up
        </Link>
      </p>
    </main>
  );
}
