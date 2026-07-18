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
    ? await prisma.owner.findUnique({
        where: { id: user.id },
        include: { pets: true },
      })
    : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-3xl font-semibold">PetSocial</h1>

      {owner ? (
        <>
          <p>
            Welcome back, <span className="font-medium">{owner.displayName}</span> (@{owner.username})
          </p>

          <div className="flex w-full flex-col gap-2">
            {owner.pets.map((pet) => (
              <Link
                key={pet.id}
                href={`/pets/${pet.id}`}
                className="rounded border px-4 py-2 text-left"
              >
                {pet.name} <span className="text-sm text-gray-500">({pet.species})</span>
              </Link>
            ))}
          </div>

          <div className="flex gap-4">
            <Link href="/pets/new" className="rounded bg-black px-4 py-2 text-white">
              Add a pet
            </Link>
            <form action={logout}>
              <button type="submit" className="rounded border px-4 py-2">
                Log out
              </button>
            </form>
          </div>
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
