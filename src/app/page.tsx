import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

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
    <main className="mx-auto flex w-full min-h-[calc(100vh-97px)] max-w-xl flex-col gap-6 p-6">
      {owner ? (
        <>
          <div className="flex items-center gap-3">
            <Avatar name={owner.displayName} size="lg" />
            <div>
              <p className="text-lg font-semibold">{owner.displayName}</p>
              <p className="text-sm text-muted">@{owner.username}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">Your pets</h2>
              <Link href="/pets/new">
                <Button variant="secondary">Add a pet</Button>
              </Link>
            </div>

            {owner.pets.length === 0 ? (
              <EmptyState>You haven&apos;t added a pet yet.</EmptyState>
            ) : (
              owner.pets.map((pet) => (
                <Link key={pet.id} href={`/pets/${pet.id}`}>
                  <Card className="flex items-center gap-3 transition-colors hover:bg-muted-bg">
                    <Avatar name={pet.name} size="md" />
                    <div>
                      <p className="font-medium">{pet.name}</p>
                      <p className="text-sm text-muted">{pet.species}</p>
                    </div>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <h1 className="text-3xl font-semibold">🐾 PetSocial</h1>
          <p className="text-muted">A social network for pets and their people.</p>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="secondary">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign up</Button>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
