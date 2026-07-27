import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Shell } from "@/components/shell";

export default async function CommunitiesPage() {
  const groups = await prisma.pet.groupBy({
    by: ["species"],
    _count: { _all: true },
    orderBy: { _count: { species: "desc" } },
  });

  return (
    <Shell>
      <div className="flex flex-col gap-4">
        <PageHeader title="Communities" back="/explore" />

        <p className="-mt-2 text-[12.5px] leading-relaxed text-muted">
          Grouped automatically from the species of every pet on PetSocial.
        </p>

        {groups.length === 0 ? (
          <EmptyState icon="pawprint" title="No communities yet">
            Communities appear as soon as pets are added.
          </EmptyState>
        ) : (
          <div className="flex flex-col gap-2.5">
            {groups.map((group) => (
              <Link key={group.species} href={`/communities/${encodeURIComponent(group.species)}`}>
                <Card padded={false} className="flex items-center gap-3 p-3 transition-colors hover:bg-muted-bg">
                  <Avatar name={group.species} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{group.species}</p>
                    <p className="mt-0.5 text-[11.5px] text-muted">
                      {group._count._all} {group._count._all === 1 ? "pet" : "pets"}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
