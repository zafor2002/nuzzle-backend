import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { FilterChips } from "@/components/ui/filter-chips";
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
        <PageHeader
          title="Adopt"
          action={
            <Link href="/adoption/new">
              <Button size="sm">Post a pet</Button>
            </Link>
          }
        />

        {speciesOptions.length > 0 && (
          <FilterChips
            active={species ?? "all"}
            options={[
              { label: "All", value: "all" },
              ...speciesOptions.map((o) => ({
                label: `${o.species} (${o._count._all})`,
                value: o.species,
              })),
            ]}
            hrefFor={(v) => (v === "all" ? "/adoption" : `/adoption?species=${encodeURIComponent(v)}`)}
          />
        )}

        {listings.length === 0 && (
          <EmptyState icon="heart" title="No pets listed right now">
            Adoptable pets posted by the community will appear here.
          </EmptyState>
        )}

        <div className="flex flex-col gap-3">
          {listings.map((listing) => (
            <Link key={listing.id} href={`/adoption/${listing.id}`}>
              <Card padded={false} className="overflow-hidden">
                <div className="relative">
                  {listing.mediaUrls[0] ? (
                    <Image
                      src={listing.mediaUrls[0]}
                      alt=""
                      width={600}
                      height={300}
                      unoptimized
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center bg-muted-bg text-4xl">
                      🐾
                    </div>
                  )}
                  <span className="absolute right-3 top-3">
                    <Badge variant={STATUS_VARIANT[listing.status as keyof typeof STATUS_VARIANT] ?? "default"}>
                      {listing.status}
                    </Badge>
                  </span>
                </div>
                <div className="flex flex-col gap-1 p-3.5">
                  <div className="flex items-baseline gap-2">
                    <span className="min-w-0 flex-1 truncate text-[15px] font-bold">{listing.name}</span>
                    {listing.location && (
                      <span className="shrink-0 text-[11.5px] text-muted">{listing.location}</span>
                    )}
                  </div>
                  <p className="text-[11.5px] text-muted">
                    {listing.species}
                    {listing.breed ? ` · ${listing.breed}` : ""}
                    {listing.age ? ` · ${listing.age}` : ""}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed">{listing.description}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </Shell>
  );
}
