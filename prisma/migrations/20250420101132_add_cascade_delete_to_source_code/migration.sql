-- DropForeignKey
ALTER TABLE "SourceCodeEmbedding" DROP CONSTRAINT "SourceCodeEmbedding_projectId_fkey";

-- AddForeignKey
ALTER TABLE "SourceCodeEmbedding" ADD CONSTRAINT "SourceCodeEmbedding_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
