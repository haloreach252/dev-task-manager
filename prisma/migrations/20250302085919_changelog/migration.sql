-- CreateTable
CREATE TABLE "Changelog" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "features" TEXT NOT NULL,
    "fixes" TEXT NOT NULL,
    "improvements" TEXT NOT NULL,

    CONSTRAINT "Changelog_pkey" PRIMARY KEY ("id")
);
