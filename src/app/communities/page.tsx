import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
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
        <h1 className="text-2xl font-semibold">Communities</h1>

        {groups.length === 0 && <EmptyState>No communities yet.</EmptyState>}

        <div className="flex flex-col gap-2">
          {groups.map((group) => (
            <Link key={group.species} href={`/communities/${encodeURIComponent(group.species)}`}>
              <Card className="flex items-center justify-between transition-colors hover:bg-muted-bg">
                <span className="font-medium">🐾 {group.species}</span>
                <span className="text-sm text-muted">
                  {group._count._all} {group._count._all === 1 ? "pet" : "pets"}
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </Shell>
  );
}
