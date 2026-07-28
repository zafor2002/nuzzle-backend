import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Shell } from "@/components/shell";
import { StoryForm } from "./story-form";

export default async function NewStoryPage() {
  const user = await requireUser();

  const pets = await prisma.pet.findMany({
    where: { ownerId: user.id },
    select: { id: true, name: true },
  });

  return (
    <Shell>
      <div className="flex flex-col gap-4">
        <PageHeader title="Add to your story" back="/feed" />
        <p className="-mt-2 text-[12.5px] text-muted">Stories disappear after 24 hours.</p>
        <Card>
          <StoryForm ownerId={user.id} pets={pets} />
        </Card>
      </div>
    </Shell>
  );
}
