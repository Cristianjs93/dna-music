-- AlterTable
ALTER TABLE "users" ADD COLUMN "created_by_id" TEXT,
ADD COLUMN "updated_by_id" TEXT;

-- AlterTable
ALTER TABLE "headquarters" ADD COLUMN "created_by_id" TEXT,
ADD COLUMN "updated_by_id" TEXT;

-- AlterTable
ALTER TABLE "students" ADD COLUMN "created_by_id" TEXT,
ADD COLUMN "updated_by_id" TEXT;

-- CreateIndex
CREATE INDEX "users_created_by_id_idx" ON "users"("created_by_id");

-- CreateIndex
CREATE INDEX "users_updated_by_id_idx" ON "users"("updated_by_id");

-- CreateIndex
CREATE INDEX "headquarters_created_by_id_idx" ON "headquarters"("created_by_id");

-- CreateIndex
CREATE INDEX "headquarters_updated_by_id_idx" ON "headquarters"("updated_by_id");

-- CreateIndex
CREATE INDEX "students_created_by_id_idx" ON "students"("created_by_id");

-- CreateIndex
CREATE INDEX "students_updated_by_id_idx" ON "students"("updated_by_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "headquarters" ADD CONSTRAINT "headquarters_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "headquarters" ADD CONSTRAINT "headquarters_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
