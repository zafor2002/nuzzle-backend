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
import { LeftSidebar } from "@/components/left-sidebar";
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
    <Shell left={<LeftSidebar />}>
      <div className="flex flex-col gap-4">
        <Link href="/adoption" className="text-sm text-muted hover:text-primary">
          &larr; All adoptable pets
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
            <h1 className="text-2xl font-semibold">{listing.name}</h1>
            <Badge variant={STATUS_VARIANT[listing.status as keyof typeof STATUS_VARIANT] ?? "default"}>
              {listing.status}
            </Badge>
          </div>

          <p className="text-sm text-muted">
            {listing.species}
            {listing.breed ? ` · ${listing.breed}` : ""}
            {listing.age ? ` · ${listing.age}` : ""}
            {listing.gender && listing.gender !== "unknown" ? ` · ${listing.gender}` : ""}
          </p>

          <p>{listing.description}</p>

          {listing.location && <p className="text-sm text-muted">📍 {listing.location}</p>}
          {listing.contactInfo && <p className="text-sm text-muted">Contact: {listing.contactInfo}</p>}

          <div className="flex items-center gap-2 border-t border-border pt-3">
            {!listing.poster.isAnonymous ? (
              <Link href={`/owners/${listing.poster.username}`} className="flex items-center gap-2">
                <Avatar name={posterName} src={listing.poster.avatarUrl} size="sm" />
                <span className="text-sm">Posted by {posterName}</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Avatar name={posterName} src={null} size="sm" />
                <span className="text-sm">Posted by {posterName}</span>
              </div>
            )}
          </div>

          {isPoster ? (
            <StatusButtons id={listing.id} status={listing.status} />
          ) : (
            user && (
              <Link href={`/messages/${listing.poster.username}`}>
                <Button>Message about {listing.name}</Button>
              </Link>
            )
          )}
        </Card>
      </div>
    </Shell>
  );
}
