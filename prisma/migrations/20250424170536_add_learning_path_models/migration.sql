-- CreateEnum
CREATE TYPE "GradeLevel" AS ENUM ('FIRST', 'SECOND', 'THIRD');

-- CreateEnum
CREATE TYPE "NodeType" AS ENUM ('YEAR', 'AXIS', 'UNIT', 'TOPIC', 'CONCEPT', 'GENERIC');

-- CreateEnum
CREATE TYPE "PrerequisiteStrength" AS ENUM ('REQUIRED', 'RECOMMENDED', 'HELPFUL');

-- CreateEnum
CREATE TYPE "ContentProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'DISMISSED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ClassAlertType" AS ENUM ('STRUGGLING_STUDENT', 'CONCEPT_DIFFICULTY', 'PROGRESS_DELAY', 'ACHIEVEMENT_GAP', 'PATTERN_DETECTED');

-- CreateEnum
CREATE TYPE "AlertPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- DropIndex
DROP INDEX "CurriculumNode_parentId_idx";

-- AlterTable
ALTER TABLE "ContentResource" ADD COLUMN     "gradeLevels" "GradeLevel"[] DEFAULT ARRAY[]::"GradeLevel"[];

-- AlterTable
ALTER TABLE "CurriculumNode" ADD COLUMN     "competencies" TEXT[],
ADD COLUMN     "estimatedTimeHours" DOUBLE PRECISION,
ADD COLUMN     "gradeLevel" "GradeLevel"[],
ADD COLUMN     "isRequired" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "learningObjectives" TEXT[],
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "nodeType" "NodeType" NOT NULL DEFAULT 'GENERIC';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "gradeLevel" "GradeLevel";

-- CreateTable
CREATE TABLE "CurriculumNodePrerequisite" (
    "id" TEXT NOT NULL,
    "prerequisiteId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "strengthLevel" "PrerequisiteStrength" NOT NULL DEFAULT 'RECOMMENDED',

    CONSTRAINT "CurriculumNodePrerequisite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "rating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,
    "contentResourceId" TEXT NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalTimeSpentMinutes" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedNodeCount" INTEGER NOT NULL DEFAULT 0,
    "masteryLevel" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "UserProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningPathProgress" (
    "id" TEXT NOT NULL,
    "userProgressId" TEXT NOT NULL,
    "curriculumNodeId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "percentComplete" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageScore" DOUBLE PRECISION,
    "strengths" TEXT[],
    "weaknesses" TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningPathProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentProgress" (
    "id" TEXT NOT NULL,
    "userProgressId" TEXT NOT NULL,
    "contentResourceId" TEXT NOT NULL,
    "status" "ContentProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "firstAccessAt" TIMESTAMP(3),
    "lastAccessAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "timeSpentMinutes" INTEGER NOT NULL DEFAULT 0,
    "score" DOUBLE PRECISION,
    "attemptsCount" INTEGER NOT NULL DEFAULT 0,
    "interactionData" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLearningAnalytics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "learningStyle" JSONB,
    "peakActivityTimes" JSONB,
    "strengths" TEXT[],
    "weaknesses" TEXT[],
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'LOW',
    "predictedAreas" JSONB,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLearningAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentRecommendation" (
    "id" TEXT NOT NULL,
    "analyticsId" TEXT NOT NULL,
    "contentResourceId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "RecommendationStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "ContentRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassProgress" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "classAverage" DOUBLE PRECISION,
    "conceptAnalysis" JSONB,

    CONSTRAINT "ClassProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurriculumNodeCoverage" (
    "id" TEXT NOT NULL,
    "classProgressId" TEXT NOT NULL,
    "curriculumNodeId" TEXT NOT NULL,
    "percentCovered" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "averageScore" DOUBLE PRECISION,

    CONSTRAINT "CurriculumNodeCoverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassAlert" (
    "id" TEXT NOT NULL,
    "classProgressId" TEXT NOT NULL,
    "alertType" "ClassAlertType" NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "AlertPriority" NOT NULL DEFAULT 'MEDIUM',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "suggestedActions" JSONB,
    "studentId" TEXT,

    CONSTRAINT "ClassAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CurriculumNodePrerequisite_prerequisiteId_nodeId_key" ON "CurriculumNodePrerequisite"("prerequisiteId", "nodeId");

-- CreateIndex
CREATE INDEX "Comment_authorId_idx" ON "Comment"("authorId");

-- CreateIndex
CREATE INDEX "Comment_contentResourceId_idx" ON "Comment"("contentResourceId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProgress_userId_key" ON "UserProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LearningPathProgress_userProgressId_curriculumNodeId_key" ON "LearningPathProgress"("userProgressId", "curriculumNodeId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentProgress_userProgressId_contentResourceId_key" ON "ContentProgress"("userProgressId", "contentResourceId");

-- CreateIndex
CREATE UNIQUE INDEX "UserLearningAnalytics_userId_key" ON "UserLearningAnalytics"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassProgress_classId_key" ON "ClassProgress"("classId");

-- AddForeignKey
ALTER TABLE "CurriculumNodePrerequisite" ADD CONSTRAINT "CurriculumNodePrerequisite_prerequisiteId_fkey" FOREIGN KEY ("prerequisiteId") REFERENCES "CurriculumNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumNodePrerequisite" ADD CONSTRAINT "CurriculumNodePrerequisite_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "CurriculumNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_contentResourceId_fkey" FOREIGN KEY ("contentResourceId") REFERENCES "ContentResource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathProgress" ADD CONSTRAINT "LearningPathProgress_userProgressId_fkey" FOREIGN KEY ("userProgressId") REFERENCES "UserProgress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathProgress" ADD CONSTRAINT "LearningPathProgress_curriculumNodeId_fkey" FOREIGN KEY ("curriculumNodeId") REFERENCES "CurriculumNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentProgress" ADD CONSTRAINT "ContentProgress_userProgressId_fkey" FOREIGN KEY ("userProgressId") REFERENCES "UserProgress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentProgress" ADD CONSTRAINT "ContentProgress_contentResourceId_fkey" FOREIGN KEY ("contentResourceId") REFERENCES "ContentResource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLearningAnalytics" ADD CONSTRAINT "UserLearningAnalytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentRecommendation" ADD CONSTRAINT "ContentRecommendation_analyticsId_fkey" FOREIGN KEY ("analyticsId") REFERENCES "UserLearningAnalytics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentRecommendation" ADD CONSTRAINT "ContentRecommendation_contentResourceId_fkey" FOREIGN KEY ("contentResourceId") REFERENCES "ContentResource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassProgress" ADD CONSTRAINT "ClassProgress_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumNodeCoverage" ADD CONSTRAINT "CurriculumNodeCoverage_classProgressId_fkey" FOREIGN KEY ("classProgressId") REFERENCES "ClassProgress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumNodeCoverage" ADD CONSTRAINT "CurriculumNodeCoverage_curriculumNodeId_fkey" FOREIGN KEY ("curriculumNodeId") REFERENCES "CurriculumNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassAlert" ADD CONSTRAINT "ClassAlert_classProgressId_fkey" FOREIGN KEY ("classProgressId") REFERENCES "ClassProgress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassAlert" ADD CONSTRAINT "ClassAlert_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
