-- CreateTable
CREATE TABLE "LearningSequence" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "curriculumNodeId" TEXT,
    "createdById" TEXT NOT NULL,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LearningSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SequencePosition" (
    "id" TEXT NOT NULL,
    "contentResourceId" TEXT NOT NULL,
    "sequenceId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SequencePosition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SequencePosition_contentResourceId_key" ON "SequencePosition"("contentResourceId");

-- CreateIndex
CREATE UNIQUE INDEX "SequencePosition_sequenceId_position_key" ON "SequencePosition"("sequenceId", "position");

-- AddForeignKey
ALTER TABLE "LearningSequence" ADD CONSTRAINT "LearningSequence_curriculumNodeId_fkey" FOREIGN KEY ("curriculumNodeId") REFERENCES "CurriculumNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningSequence" ADD CONSTRAINT "LearningSequence_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SequencePosition" ADD CONSTRAINT "SequencePosition_contentResourceId_fkey" FOREIGN KEY ("contentResourceId") REFERENCES "ContentResource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SequencePosition" ADD CONSTRAINT "SequencePosition_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "LearningSequence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
