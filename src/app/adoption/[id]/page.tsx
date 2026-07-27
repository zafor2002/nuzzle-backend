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
import { StatusButtons } from "./status-buttons";

const STATUS_VARIANT = {
  available: "success",
  pending: "default",
  adopted: "muted",
} as const;

export default async function AdoptionListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const listing = await prisma.adoptionListing.findUnique({
    where: { id },
    include: { poster: true },
  });

  if (!listing) {
    notFound();
  }

  const isPoster = user?.id === listing.posterId;
  const posterName = listing.poster.isAnonymous ? "Anonymous" : listing.poster.displayName;

  return (
    <Shell>
      <div className="flex flex-col gap-4">
        <Link href="/adoption" className="text-sm text-muted hover:text-primary">
          &larr; All adoptable pets
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
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="truncate text-[21px] font-bold">{listing.name}</h1>
                <p className="mt-1 text-[11.5px] text-muted">
                  {listing.species}
                  {listing.breed ? ` · ${listing.breed}` : ""}
                  {listing.age ? ` · ${listing.age}` : ""}
                  {listing.gender && listing.gender !== "unknown" ? ` · ${listing.gender}` : ""}
                  {listing.location ? ` · ${listing.location}` : ""}
                </p>
              </div>
              <Badge variant={STATUS_VARIANT[listing.status as keyof typeof STATUS_VARIANT] ?? "default"}>
                {listing.status}
              </Badge>
            </div>

            <p className="text-sm leading-relaxed">{listing.description}</p>

            {listing.contactInfo && (
              <p className="text-[11.5px] text-muted">Contact: {listing.contactInfo}</p>
            )}

            <div className="mt-1 border-t border-border pt-3">
              <p className="mb-2 text-[13px] font-bold text-muted">Listed by</p>
              {!listing.poster.isAnonymous ? (
                <Link href={`/owners/${listing.poster.username}`} className="flex items-center gap-2.5">
                  <Avatar name={posterName} src={listing.poster.avatarUrl} />
                  <span className="min-w-0 flex-1 truncate text-sm font-bold">{posterName}</span>
                </Link>
              ) : (
                <div className="flex items-center gap-2.5">
                  <Avatar name={posterName} src={null} />
                  <span className="text-sm font-bold">{posterName}</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {isPoster ? (
          <StatusButtons id={listing.id} status={listing.status} />
        ) : (
          user && (
            <Link href={`/messages/${listing.poster.username}`}>
              <Button className="w-full">
                <Icon name="chat" className="h-5 w-5" /> Contact about {listing.name}
              </Button>
            </Link>
          )
        )}
      </div>
    </Shell>
  );
}
