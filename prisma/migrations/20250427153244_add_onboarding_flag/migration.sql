-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hasCompletedOnboarding" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "credits" SET DEFAULT 0,
ALTER COLUMN "clerkUserId" DROP NOT NULL;
