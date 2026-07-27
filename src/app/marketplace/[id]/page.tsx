import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
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

        <Card padded={false} className="overflow-hidden">
          {listing.mediaUrls[0] && (
            <Image
              src={listing.mediaUrls[0]}
              alt=""
              width={600}
              height={600}
              unoptimized
              className="max-h-[380px] w-full object-cover"
            />
          )}

          <div className="flex flex-col gap-2.5 p-4">
            <p className="text-[23px] font-bold">${listing.price.toFixed(2)}</p>
            <h1 className="text-[15px] leading-snug">{listing.title}</h1>

            <div className="flex flex-wrap gap-2">
              <Badge variant="info">{listing.category}</Badge>
              {listing.location && <Badge variant="muted">{listing.location}</Badge>}
              {listing.status === "sold" && <Badge variant="muted">Sold</Badge>}
            </div>

            <p className="text-sm leading-relaxed">{listing.description}</p>

            <div className="mt-1 border-t border-border pt-3">
              <p className="mb-2 text-[13px] font-bold text-muted">Seller</p>
              {!listing.seller.isAnonymous ? (
                <Link href={`/owners/${listing.seller.username}`} className="flex items-center gap-2.5">
                  <Avatar name={sellerName} src={listing.seller.avatarUrl} />
                  <span className="min-w-0 flex-1 truncate text-sm font-bold">{sellerName}</span>
                </Link>
              ) : (
                <div className="flex items-center gap-2.5">
                  <Avatar name={sellerName} src={null} />
                  <span className="text-sm font-bold">{sellerName}</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {isSeller ? (
          <SoldButton id={listing.id} status={listing.status} />
        ) : (
          user && (
            <Link href={`/messages/${listing.seller.username}`}>
              <Button className="w-full">
                <Icon name="chat" className="h-5 w-5" /> Message seller
              </Button>
            </Link>
          )
        )}
      </div>
    </Shell>
  );
}
