import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { logout } from "@/app/actions/auth";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const owner = user
    ? await prisma.owner.findUnique({ where: { id: user.id } })
    : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-3xl font-semibold">PetSocial</h1>

      {owner ? (
        <>
          <p>
            Welcome back, <span className="font-medium">{owner.displayName}</span> (@{owner.username})
          </p>
          <form action={logout}>
            <button type="submit" className="rounded bg-black px-4 py-2 text-white">
              Log out
            </button>
          </form>
        </>
      ) : (
        <div className="flex gap-4">
          <Link href="/login" className="rounded border px-4 py-2">
            Log in
          </Link>
          <Link href="/signup" className="rounded bg-black px-4 py-2 text-white">
            Sign up
          </Link>
        </div>
      )}
    </main>
  );
}
