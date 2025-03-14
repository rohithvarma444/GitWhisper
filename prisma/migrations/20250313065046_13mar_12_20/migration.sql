-- CreateTable
CREATE TABLE "Commit" (
    "id" TEXT NOT NULL,
    "commitHash" TEXT NOT NULL,
    "commitMessage" TEXT NOT NULL,
    "commitAuthor" TEXT NOT NULL,
    "commitAuthorAvatarUrl" TEXT NOT NULL,
    "commitDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "Commit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Commit" ADD CONSTRAINT "Commit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
