import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Shell } from "@/components/shell";
import { ReelForm } from "./reel-form";

export default async function NewReelPage() {
  const user = await requireUser();

  const pets = await prisma.pet.findMany({
    where: { ownerId: user.id },
    select: { id: true, name: true },
  });

  return (
    <Shell>
      <div className="flex flex-col gap-4">
        <PageHeader title="New reel" back="/reels" />
        <p className="-mt-2 text-[12.5px] leading-relaxed text-muted">
          Up to 90 seconds and 50MB. Videos are served exactly as uploaded, so keep them small
          enough to play on mobile data.
        </p>
        <Card>
          <ReelForm ownerId={user.id} pets={pets} />
        </Card>
      </div>
    </Shell>
  );
}
