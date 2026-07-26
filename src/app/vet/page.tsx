import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ensureVetsSeeded } from "@/lib/vet-seed";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shell } from "@/components/shell";

export default async function VetDirectoryPage() {
  await ensureVetsSeeded();

  const vets = await prisma.vet.findMany({ orderBy: { rating: "desc" } });

  return (
    <Shell>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Book a Vet</h1>
          <Link href="/vet/appointments">
            <Button variant="secondary">My appointments</Button>
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          {vets.map((vet) => (
            <Card key={vet.id} className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{vet.clinicName}</p>
                <p className="text-sm text-muted">{vet.name}</p>
                {vet.location && <p className="text-xs text-muted">{vet.location}</p>}
                <p className="mt-1 text-sm">⭐ {vet.rating.toFixed(1)}</p>
                {vet.bio && <p className="mt-1 text-sm text-muted">{vet.bio}</p>}
              </div>
              <Link href={`/vet/${vet.id}`}>
                <Button>Book</Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </Shell>
  );
}
