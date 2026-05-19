/*
  Warnings:

  - You are about to drop the column `pdfName` on the `Proposal` table. All the data in the column will be lost.
  - You are about to drop the column `pdfPath` on the `Proposal` table. All the data in the column will be lost.
  - You are about to drop the column `pdfSize` on the `Proposal` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Proposal" DROP COLUMN "pdfName",
DROP COLUMN "pdfPath",
DROP COLUMN "pdfSize";

-- CreateTable
CREATE TABLE "AppointmentFile" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppointmentFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalFile" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProposalFile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AppointmentFile" ADD CONSTRAINT "AppointmentFile_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalFile" ADD CONSTRAINT "ProposalFile_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
