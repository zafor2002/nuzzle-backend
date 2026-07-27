import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ensureVetsSeeded } from "@/lib/vet-seed";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Icon } from "@/components/ui/icon";
import { Shell } from "@/components/shell";

export default async function VetDirectoryPage() {
  await ensureVetsSeeded();

  const vets = await prisma.vet.findMany({ orderBy: { rating: "desc" } });

  return (
    <Shell>
      <div className="flex flex-col gap-4">
        <PageHeader
          title="Book a vet"
          action={
            <Link href="/vet/appointments">
              <Button variant="secondary" size="sm">
                <Icon name="calendar" className="h-4 w-4" />
                Mine
              </Button>
            </Link>
          }
        />

        {vets.length === 0 ? (
          <EmptyState icon="cross" title="No clinics yet">
            Veterinary clinics will appear here once they are listed.
          </EmptyState>
        ) : (
          <div className="flex flex-col gap-2.5">
            {vets.map((vet) => (
              <Link key={vet.id} href={`/vet/${vet.id}`}>
                <Card padded={false} className="flex gap-3 p-3.5 transition-colors hover:bg-muted-bg">
                  <Avatar name={vet.name} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{vet.name}</p>
                    <p className="mt-0.5 truncate text-[11.5px] text-muted">
                      {vet.clinicName}
                      {vet.location ? ` · ${vet.location}` : ""}
                    </p>
                    {vet.bio && <p className="mt-0.5 line-clamp-2 text-[11.5px] text-muted">{vet.bio}</p>}
                    <div className="mt-2">
                      <Badge variant="warn">★ {vet.rating.toFixed(1)}</Badge>
                    </div>
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
