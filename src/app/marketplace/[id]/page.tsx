import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shell } from "@/components/shell";
import { SoldButton } from "./sold-button";

export default async function MarketplaceListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const listing = await prisma.marketplaceListing.findUnique({
    where: { id },
    include: { seller: true },
  });

  if (!listing) {
    notFound();
  }

  const isSeller = user?.id === listing.sellerId;
  const sellerName = listing.seller.isAnonymous ? "Anonymous" : listing.seller.displayName;

  return (
    <Shell>
      <div className="flex flex-col gap-4">
        <Link href="/marketplace" className="text-sm text-muted hover:text-primary">
          &larr; Marketplace
        </Link>

        <Card className="flex flex-col gap-3">
          {listing.mediaUrls[0] && (
            <Image
              src={listing.mediaUrls[0]}
              alt=""
              width={600}
              height={400}
              unoptimized
              className="w-full rounded-md object-cover"
            />
          )}

          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">{listing.title}</h1>
            {listing.status === "sold" && <Badge variant="muted">Sold</Badge>}
          </div>

          <p className="text-2xl font-bold">${listing.price.toFixed(2)}</p>
          <p className="text-sm capitalize text-muted">{listing.category}</p>

          <p>{listing.description}</p>

          {listing.location && <p className="text-sm text-muted">📍 {listing.location}</p>}

          <div className="flex items-center gap-2 border-t border-border pt-3">
            {!listing.seller.isAnonymous ? (
              <Link href={`/owners/${listing.seller.username}`} className="flex items-center gap-2">
                <Avatar name={sellerName} src={listing.seller.avatarUrl} size="sm" />
                <span className="text-sm">Sold by {sellerName}</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Avatar name={sellerName} src={null} size="sm" />
                <span className="text-sm">Sold by {sellerName}</span>
              </div>
            )}
          </div>

          {isSeller ? (
            <SoldButton id={listing.id} status={listing.status} />
          ) : (
            user && (
              <Link href={`/messages/${listing.seller.username}`}>
                <Button>Message about {listing.title}</Button>
              </Link>
            )
          )}
        </Card>
      </div>
    </Shell>
  );
}
