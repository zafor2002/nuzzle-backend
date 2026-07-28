-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "petId" TEXT,
    "mediaUrl" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryView" (
    "storyId" TEXT NOT NULL,
    "viewerId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryView_pkey" PRIMARY KEY ("storyId","viewerId")
);

-- CreateTable
CREATE TABLE "Reel" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "petId" TEXT,
    "videoUrl" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReelLike" (
    "reelId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReelLike_pkey" PRIMARY KEY ("reelId","ownerId")
);

-- CreateIndex
CREATE INDEX "Story_ownerId_idx" ON "Story"("ownerId");

-- CreateIndex
CREATE INDEX "Story_expiresAt_idx" ON "Story"("expiresAt");

-- CreateIndex
CREATE INDEX "StoryView_viewerId_idx" ON "StoryView"("viewerId");

-- CreateIndex
CREATE INDEX "Reel_ownerId_idx" ON "Reel"("ownerId");

-- CreateIndex
CREATE INDEX "Reel_createdAt_idx" ON "Reel"("createdAt");

-- CreateIndex
CREATE INDEX "ReelLike_ownerId_idx" ON "ReelLike"("ownerId");

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryView" ADD CONSTRAINT "StoryView_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryView" ADD CONSTRAINT "StoryView_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reel" ADD CONSTRAINT "Reel_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reel" ADD CONSTRAINT "Reel_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReelLike" ADD CONSTRAINT "ReelLike_reelId_fkey" FOREIGN KEY ("reelId") REFERENCES "Reel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReelLike" ADD CONSTRAINT "ReelLike_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
