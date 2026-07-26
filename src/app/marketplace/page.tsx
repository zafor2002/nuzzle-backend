import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Marketplace</h1>
          <Link href="/marketplace/new">
            <Button>Sell something</Button>
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/marketplace"
            className={`rounded-full border border-border px-3 py-1 ${!category ? "bg-primary text-primary-foreground" : "hover:bg-muted-bg"}`}
          >
            All
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/marketplace?category=${c}`}
              className={`rounded-full border border-border px-3 py-1 capitalize ${category === c ? "bg-primary text-primary-foreground" : "hover:bg-muted-bg"}`}
            >
              {c}
            </Link>
          ))}
        </div>

        {listings.length === 0 && <EmptyState>No listings yet.</EmptyState>}

        <div className="grid grid-cols-2 gap-3">
          {listings.map((listing) => (
            <Link key={listing.id} href={`/marketplace/${listing.id}`}>
              <Card className="flex flex-col gap-1 overflow-hidden p-0">
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
                <div className="flex flex-col gap-0.5 p-2.5">
                  <p className="truncate text-sm font-semibold">{listing.title}</p>
                  <p className="font-bold">${listing.price.toFixed(2)}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </Shell>
  );
}
