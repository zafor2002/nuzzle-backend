import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Shell } from "@/components/shell";

const STATUS_VARIANT = {
  available: "success",
  pending: "default",
  adopted: "muted",
} as const;

export default async function AdoptionPage({
  searchParams,
}: {
  searchParams: Promise<{ species?: string }>;
}) {
  const { species } = await searchParams;

  const [listings, speciesOptions] = await Promise.all([
    prisma.adoptionListing.findMany({
      where: { status: { not: "adopted" }, ...(species ? { species } : {}) },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { poster: true },
    }),
    prisma.adoptionListing.groupBy({ by: ["species"], _count: { _all: true } }),
  ]);

  return (
    <Shell>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Adopt</h1>
          <Link href="/adoption/new">
            <Button>Post a pet</Button>
          </Link>
        </div>

        {speciesOptions.length > 0 && (
          <div className="flex flex-wrap gap-2 text-sm">
            <Link
              href="/adoption"
              className={`rounded-full border border-border px-3 py-1 ${!species ? "bg-primary text-primary-foreground" : "hover:bg-muted-bg"}`}
            >
              All
            </Link>
            {speciesOptions.map((opt) => (
              <Link
                key={opt.species}
                href={`/adoption?species=${encodeURIComponent(opt.species)}`}
                className={`rounded-full border border-border px-3 py-1 ${species === opt.species ? "bg-primary text-primary-foreground" : "hover:bg-muted-bg"}`}
              >
                {opt.species} ({opt._count._all})
              </Link>
            ))}
          </div>
        )}

        {listings.length === 0 && <EmptyState>No adoptable pets listed right now.</EmptyState>}

        <div className="flex flex-col gap-3">
          {listings.map((listing) => (
            <Link key={listing.id} href={`/adoption/${listing.id}`}>
              <Card className="flex gap-3 overflow-hidden p-3">
                {listing.mediaUrls[0] ? (
                  <Image
                    src={listing.mediaUrls[0]}
                    alt=""
                    width={112}
                    height={112}
                    unoptimized
                    className="h-28 w-28 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-md bg-muted-bg text-3xl">
                    🐾
                  </div>
                )}
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{listing.name}</span>
                    <Badge variant={STATUS_VARIANT[listing.status as keyof typeof STATUS_VARIANT] ?? "default"}>
                      {listing.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted">
                    {listing.species}
                    {listing.breed ? ` · ${listing.breed}` : ""}
                    {listing.age ? ` · ${listing.age}` : ""}
                  </p>
                  <p className="line-clamp-2 text-sm">{listing.description}</p>
                  {listing.location && <p className="text-xs text-muted">{listing.location}</p>}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </Shell>
  );
}
