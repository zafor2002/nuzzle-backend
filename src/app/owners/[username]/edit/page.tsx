import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { EditOwnerForm } from "./edit-owner-form";

export default async function EditOwnerProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await requireUser();

  const owner = await prisma.owner.findUnique({ where: { username } });
  if (!owner) {
    notFound();
  }
  if (owner.id !== user.id) {
    redirect(`/owners/${username}`);
  }

  return (
    <main className="mx-auto flex w-full min-h-[calc(100vh-65px)] max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Edit profile</h1>
      <Card>
        <EditOwnerForm
          ownerId={owner.id}
          displayName={owner.displayName}
          bio={owner.bio ?? ""}
          avatarUrl={owner.avatarUrl}
          isAnonymous={owner.isAnonymous}
          isPrivate={owner.isPrivate}
        />
      </Card>
    </main>
  );
}
