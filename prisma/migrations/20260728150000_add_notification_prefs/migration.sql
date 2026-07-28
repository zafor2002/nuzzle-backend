-- AlterTable
ALTER TABLE "Owner" ADD COLUMN     "notifyComments" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyFollows" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyLikes" BOOLEAN NOT NULL DEFAULT true;
