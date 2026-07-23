-- CreateTable
CREATE TABLE "AdoptionListing" (
    "id" TEXT NOT NULL,
    "posterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "breed" TEXT,
    "age" TEXT,
    "gender" TEXT,
    "description" TEXT NOT NULL,
    "mediaUrls" TEXT[],
    "location" TEXT,
    "contactInfo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'available',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdoptionListing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdoptionListing_posterId_idx" ON "AdoptionListing"("posterId");

-- AddForeignKey
ALTER TABLE "AdoptionListing" ADD CONSTRAINT "AdoptionListing_posterId_fkey" FOREIGN KEY ("posterId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
