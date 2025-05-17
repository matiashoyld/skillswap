-- AlterTable
ALTER TABLE "FeedbackResponse" ADD COLUMN     "flagReason" TEXT,
ADD COLUMN     "isFlagged" BOOLEAN NOT NULL DEFAULT false;
