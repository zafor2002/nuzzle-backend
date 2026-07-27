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

const CATEGORIES = ["food", "toys", "beds", "health", "accessories", "other"] as const;

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  const listings = await prisma.marketplaceListing.findMany({
    where: category ? { category } : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <Shell>
      <div className="flex flex-col gap-4">
        <PageHeader
          title="Marketplace"
          action={
            <Link href="/marketplace/new">
              <Button size="sm">Sell</Button>
            </Link>
          }
        />

        <FilterChips
          active={category ?? "all"}
          options={[
            { label: "All", value: "all" },
            ...CATEGORIES.map((c) => ({ label: c, value: c })),
          ]}
          hrefFor={(v) => (v === "all" ? "/marketplace" : `/marketplace?category=${v}`)}
        />

        {listings.length === 0 && (
          <EmptyState icon="cart" title="Nothing listed yet">
            Pet gear people are selling will show up here.
          </EmptyState>
        )}

        <div className="grid grid-cols-2 gap-3">
          {listings.map((listing) => (
            <Link key={listing.id} href={`/marketplace/${listing.id}`}>
              <Card padded={false} className="flex flex-col gap-1 overflow-hidden">
                <div className="relative">
                  {listing.mediaUrls[0] ? (
                    <Image
                      src={listing.mediaUrls[0]}
                      alt=""
                      width={200}
                      height={140}
                      unoptimized
                      className="h-32 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-32 w-full items-center justify-center bg-muted-bg text-3xl">
                      🛍️
                    </div>
                  )}
                  {listing.status === "sold" && (
                    <span className="absolute left-2 top-2">
                      <Badge variant="muted">Sold</Badge>
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1 p-2.5">
                  <p className="text-sm font-bold">${listing.price.toFixed(2)}</p>
                  <p className="line-clamp-2 text-[11.5px] leading-snug">{listing.title}</p>
                  <p className="text-[11.5px] capitalize text-muted">{listing.category}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </Shell>
  );
}
