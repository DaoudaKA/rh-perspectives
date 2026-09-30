-- CreateEnum
CREATE TYPE "Role" AS ENUM ('COLLABORATEUR', 'MANAGER', 'ADMINISTRATEUR');

-- CreateEnum
CREATE TYPE "StatutTache" AS ENUM ('BROUILLON', 'SOUMISE', 'VALIDEE', 'REJETEE');

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'COLLABORATEUR',
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifieLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taches" (
    "id" TEXT NOT NULL,
    "titre" VARCHAR(150) NOT NULL,
    "description" TEXT NOT NULL,
    "statut" "StatutTache" NOT NULL DEFAULT 'BROUILLON',
    "commentaireRejet" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifieLe" TIMESTAMP(3) NOT NULL,
    "createurId" TEXT NOT NULL,
    "validateurId" TEXT,

    CONSTRAINT "taches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE INDEX "taches_createurId_idx" ON "taches"("createurId");

-- CreateIndex
CREATE INDEX "taches_statut_idx" ON "taches"("statut");

-- AddForeignKey
ALTER TABLE "taches" ADD CONSTRAINT "taches_createurId_fkey" FOREIGN KEY ("createurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taches" ADD CONSTRAINT "taches_validateurId_fkey" FOREIGN KEY ("validateurId") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
