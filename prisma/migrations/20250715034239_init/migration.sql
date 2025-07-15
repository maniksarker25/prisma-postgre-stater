/*
  Warnings:

  - The values [DOCTOR,PATIENT] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `contactNumber` on the `admins` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `admins` table. All the data in the column will be lost.
  - You are about to drop the column `profilePhoto` on the `admins` table. All the data in the column will be lost.
  - You are about to drop the column `needPasswordChange` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `appointments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `doctorSchedules` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `doctorSpecialties` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `doctors` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `medicalReport` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `patientHealthDatas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `patients` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `prescriptions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reviews` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `schedules` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `spacialties` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[id]` on the table `admins` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `admins` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `admins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileId` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "admins" DROP CONSTRAINT "admins_email_fkey";

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_patientId_fkey";

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_scheduleId_fkey";

-- DropForeignKey
ALTER TABLE "doctorSchedules" DROP CONSTRAINT "doctorSchedules_appointmentId_fkey";

-- DropForeignKey
ALTER TABLE "doctorSchedules" DROP CONSTRAINT "doctorSchedules_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "doctorSchedules" DROP CONSTRAINT "doctorSchedules_scheduleId_fkey";

-- DropForeignKey
ALTER TABLE "doctorSpecialties" DROP CONSTRAINT "doctorSpecialties_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "doctorSpecialties" DROP CONSTRAINT "doctorSpecialties_specialtiesId_fkey";

-- DropForeignKey
ALTER TABLE "doctors" DROP CONSTRAINT "doctors_email_fkey";

-- DropForeignKey
ALTER TABLE "medicalReport" DROP CONSTRAINT "medicalReport_patientId_fkey";

-- DropForeignKey
ALTER TABLE "patientHealthDatas" DROP CONSTRAINT "patientHealthDatas_patientId_fkey";

-- DropForeignKey
ALTER TABLE "patients" DROP CONSTRAINT "patients_email_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_appointmentId_fkey";

-- DropForeignKey
ALTER TABLE "prescriptions" DROP CONSTRAINT "prescriptions_appointmentId_fkey";

-- DropForeignKey
ALTER TABLE "prescriptions" DROP CONSTRAINT "prescriptions_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "prescriptions" DROP CONSTRAINT "prescriptions_patientId_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_appointmentId_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_patientId_fkey";

-- DropIndex
DROP INDEX "admins_email_key";

-- AlterTable
ALTER TABLE "admins" DROP COLUMN "contactNumber",
DROP COLUMN "isDeleted",
DROP COLUMN "profilePhoto",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "profile_image" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "needPasswordChange",
DROP COLUMN "status",
ADD COLUMN     "isBlocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profileId" TEXT NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'USER';

-- DropTable
DROP TABLE "appointments";

-- DropTable
DROP TABLE "doctorSchedules";

-- DropTable
DROP TABLE "doctorSpecialties";

-- DropTable
DROP TABLE "doctors";

-- DropTable
DROP TABLE "medicalReport";

-- DropTable
DROP TABLE "patientHealthDatas";

-- DropTable
DROP TABLE "patients";

-- DropTable
DROP TABLE "payments";

-- DropTable
DROP TABLE "prescriptions";

-- DropTable
DROP TABLE "reviews";

-- DropTable
DROP TABLE "schedules";

-- DropTable
DROP TABLE "spacialties";

-- DropEnum
DROP TYPE "AppointmentStatus";

-- DropEnum
DROP TYPE "BloodGroup";

-- DropEnum
DROP TYPE "Gender";

-- DropEnum
DROP TYPE "MaritalStatus";

-- DropEnum
DROP TYPE "PaymentStatus";

-- DropEnum
DROP TYPE "UserStatus";

-- CreateTable
CREATE TABLE "normalUsers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "profileImage" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "education" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "normalUsers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "superAdmins" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "profile_image" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "superAdmins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "normalUsers_id_key" ON "normalUsers"("id");

-- CreateIndex
CREATE UNIQUE INDEX "normalUsers_userId_key" ON "normalUsers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "superAdmins_id_key" ON "superAdmins"("id");

-- CreateIndex
CREATE UNIQUE INDEX "superAdmins_userId_key" ON "superAdmins"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "admins_id_key" ON "admins"("id");

-- CreateIndex
CREATE UNIQUE INDEX "admins_userId_key" ON "admins"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");

-- AddForeignKey
ALTER TABLE "normalUsers" ADD CONSTRAINT "normalUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "superAdmins" ADD CONSTRAINT "superAdmins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
