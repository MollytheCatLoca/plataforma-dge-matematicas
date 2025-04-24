-- CreateTable
CREATE TABLE "ClassLearningSequence" (
    "id" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "instructions" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "classId" TEXT NOT NULL,
    "sequenceId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,

    CONSTRAINT "ClassLearningSequence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClassLearningSequence_classId_idx" ON "ClassLearningSequence"("classId");

-- CreateIndex
CREATE INDEX "ClassLearningSequence_sequenceId_idx" ON "ClassLearningSequence"("sequenceId");

-- CreateIndex
CREATE INDEX "ClassLearningSequence_assignedById_idx" ON "ClassLearningSequence"("assignedById");

-- CreateIndex
CREATE UNIQUE INDEX "ClassLearningSequence_classId_sequenceId_key" ON "ClassLearningSequence"("classId", "sequenceId");

-- AddForeignKey
ALTER TABLE "ClassLearningSequence" ADD CONSTRAINT "ClassLearningSequence_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassLearningSequence" ADD CONSTRAINT "ClassLearningSequence_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "LearningSequence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassLearningSequence" ADD CONSTRAINT "ClassLearningSequence_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
