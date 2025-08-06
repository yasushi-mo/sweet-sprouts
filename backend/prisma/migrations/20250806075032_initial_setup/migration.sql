-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'GUARDIAN', 'VIEWER');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "RecordType" AS ENUM ('FEEDING', 'DIAPER', 'SLEEP', 'BATH', 'MEDICINE', 'WALK', 'OTHER');

-- CreateEnum
CREATE TYPE "FeedingMethod" AS ENUM ('DIRECT_BREAST', 'PUMPED_BREAST', 'FORMULA');

-- CreateEnum
CREATE TYPE "BreastSide" AS ENUM ('LEFT', 'RIGHT', 'BOTH');

-- CreateEnum
CREATE TYPE "DiaperType" AS ENUM ('POOP', 'PEE');

-- CreateEnum
CREATE TYPE "PoopConsistency" AS ENUM ('SOLID', 'LOOSE', 'DIARRHEA', 'OTHER');

-- CreateEnum
CREATE TYPE "PoopColor" AS ENUM ('BLACK', 'GREEN', 'YELLOW', 'BROWN', 'RED', 'WHITE', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'GUARDIAN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "children" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateOfBirth" DATE NOT NULL,
    "gender" "Gender" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "children_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "records" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "type" "RecordType" NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feeding_details" (
    "id" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "feeding_method" "FeedingMethod" NOT NULL,
    "breast_side" "BreastSide",
    "amount_ml" INTEGER,
    "end_time" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feeding_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diaper_details" (
    "id" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "diaper_type" "DiaperType" NOT NULL,
    "poop_consistency" "PoopConsistency",
    "poop_color" "PoopColor",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diaper_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "feeding_details_record_id_key" ON "feeding_details"("record_id");

-- CreateIndex
CREATE UNIQUE INDEX "diaper_details_record_id_key" ON "diaper_details"("record_id");

-- AddForeignKey
ALTER TABLE "children" ADD CONSTRAINT "children_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "records" ADD CONSTRAINT "records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "records" ADD CONSTRAINT "records_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feeding_details" ADD CONSTRAINT "feeding_details_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diaper_details" ADD CONSTRAINT "diaper_details_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
