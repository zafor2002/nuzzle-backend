-- CreateTable
CREATE TABLE "Vet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clinicName" TEXT NOT NULL,
    "location" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 4.8,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "vetId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Appointment_ownerId_idx" ON "Appointment"("ownerId");

-- CreateIndex
CREATE INDEX "Appointment_petId_idx" ON "Appointment"("petId");

-- CreateIndex
CREATE INDEX "Appointment_vetId_scheduledAt_idx" ON "Appointment"("vetId", "scheduledAt");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_vetId_fkey" FOREIGN KEY ("vetId") REFERENCES "Vet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
