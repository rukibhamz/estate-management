-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "coverImage" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectMembership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "userId" TEXT,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "invitedEmail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProjectMembership_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProjectMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MembershipScope" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "membershipId" TEXT NOT NULL,
    "estateId" TEXT,
    "developmentId" TEXT,
    CONSTRAINT "MembershipScope_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "ProjectMembership" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MembershipScope_estateId_fkey" FOREIGN KEY ("estateId") REFERENCES "Estate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MembershipScope_developmentId_fkey" FOREIGN KEY ("developmentId") REFERENCES "Development" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Estate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Estate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Land" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "estateId" TEXT,
    "size" DECIMAL,
    "location" TEXT,
    "coordinates" JSONB,
    "titleStatus" TEXT,
    "status" TEXT NOT NULL DEFAULT 'HELD_OWNED',
    "previousStatus" TEXT,
    "acquisitionSource" TEXT,
    "acquisitionValue" DECIMAL,
    "acquisitionDate" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Land_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Land_estateId_fkey" FOREIGN KEY ("estateId") REFERENCES "Estate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Development" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "estateId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "plannedUnitCount" INTEGER,
    "startDate" DATETIME,
    "targetDate" DATETIME,
    "approvedBudget" DECIMAL,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "progressPct" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Development_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Development_estateId_fkey" FOREIGN KEY ("estateId") REFERENCES "Estate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DevelopmentLand" (
    "developmentId" TEXT NOT NULL,
    "landId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    PRIMARY KEY ("developmentId", "landId"),
    CONSTRAINT "DevelopmentLand_developmentId_fkey" FOREIGN KEY ("developmentId") REFERENCES "Development" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DevelopmentLand_landId_fkey" FOREIGN KEY ("landId") REFERENCES "Land" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Phase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "developmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetDate" DATETIME,
    "actualDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "weight" INTEGER,
    "budget" DECIMAL,
    "progressPct" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Phase_developmentId_fkey" FOREIGN KEY ("developmentId") REFERENCES "Development" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Phase_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetDate" DATETIME,
    "completionDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    CONSTRAINT "Milestone_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Milestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProgressUpdate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "developmentId" TEXT,
    "phaseId" TEXT,
    "progressPct" INTEGER NOT NULL,
    "note" TEXT,
    "issuesRisks" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProgressUpdate_developmentId_fkey" FOREIGN KEY ("developmentId") REFERENCES "Development" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProgressUpdate_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProgressUpdate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SpendRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "developmentId" TEXT,
    "phaseId" TEXT,
    "amount" DECIMAL NOT NULL,
    "date" DATETIME NOT NULL,
    "category" TEXT,
    "reference" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SpendRecord_developmentId_fkey" FOREIGN KEY ("developmentId") REFERENCES "Development" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SpendRecord_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SpendRecord_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Contractor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "role" TEXT,
    CONSTRAINT "Contractor_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DevelopmentContractor" (
    "developmentId" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "phaseId" TEXT,
    "projectId" TEXT NOT NULL,

    PRIMARY KEY ("developmentId", "contractorId"),
    CONSTRAINT "DevelopmentContractor_developmentId_fkey" FOREIGN KEY ("developmentId") REFERENCES "Development" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DevelopmentContractor_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Building" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "estateId" TEXT,
    "developmentId" TEXT,
    "name" TEXT NOT NULL,
    "status" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Building_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Building_estateId_fkey" FOREIGN KEY ("estateId") REFERENCES "Estate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Building_developmentId_fkey" FOREIGN KEY ("developmentId") REFERENCES "Development" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "estateId" TEXT,
    "developmentId" TEXT,
    "buildingId" TEXT,
    "landId" TEXT,
    "unitRef" TEXT NOT NULL,
    "type" TEXT,
    "size" DECIMAL,
    "status" TEXT NOT NULL DEFAULT 'UNDER_CONSTRUCTION',
    "previousStatus" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Unit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Unit_estateId_fkey" FOREIGN KEY ("estateId") REFERENCES "Estate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Unit_developmentId_fkey" FOREIGN KEY ("developmentId") REFERENCES "Development" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Unit_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Unit_landId_fkey" FOREIGN KEY ("landId") REFERENCES "Land" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuyerContact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BuyerContact_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SaleAllocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "assetType" TEXT NOT NULL,
    "unitId" TEXT,
    "landId" TEXT,
    "buyerId" TEXT,
    "agreedValue" DECIMAL NOT NULL,
    "totalPaid" DECIMAL NOT NULL DEFAULT 0,
    "isOverpaid" BOOLEAN NOT NULL DEFAULT false,
    "commercialStatus" TEXT NOT NULL DEFAULT 'RESERVED',
    "paymentStatus" TEXT NOT NULL DEFAULT 'NOT_APPLICABLE',
    "assignedUserId" TEXT,
    "cancellationReason" TEXT,
    "notes" TEXT,
    "followUpDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SaleAllocation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SaleAllocation_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SaleAllocation_landId_fkey" FOREIGN KEY ("landId") REFERENCES "Land" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SaleAllocation_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "BuyerContact" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PaymentRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "paymentDate" DATETIME NOT NULL,
    "method" TEXT,
    "reference" TEXT,
    "note" TEXT,
    "recordedBy" TEXT NOT NULL,
    "editableUntil" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "deletedBy" TEXT,
    "deletedReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentRecord_recordedBy_fkey" FOREIGN KEY ("recordedBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PaymentRecord_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "SaleAllocation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PaymentRecord_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "linkedType" TEXT NOT NULL,
    "linkedId" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'OTHER',
    "fileKey" TEXT NOT NULL,
    "description" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "progressUpdateId" TEXT,
    "saleId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Document_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Document_progressUpdateId_fkey" FOREIGN KEY ("progressUpdateId") REFERENCES "ProgressUpdate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Document_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "SaleAllocation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StatusActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "recordType" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "changedBy" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StatusActivityLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "recordType" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "triggeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" DATETIME,
    CONSTRAINT "Notification_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "Project_ownerId_idx" ON "Project"("ownerId");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "ProjectMembership_projectId_status_idx" ON "ProjectMembership"("projectId", "status");

-- CreateIndex
CREATE INDEX "ProjectMembership_userId_idx" ON "ProjectMembership"("userId");

-- CreateIndex
CREATE INDEX "ProjectMembership_projectId_invitedEmail_idx" ON "ProjectMembership"("projectId", "invitedEmail");

-- CreateIndex
CREATE INDEX "MembershipScope_membershipId_idx" ON "MembershipScope"("membershipId");

-- CreateIndex
CREATE INDEX "Estate_projectId_idx" ON "Estate"("projectId");

-- CreateIndex
CREATE INDEX "Land_projectId_status_idx" ON "Land"("projectId", "status");

-- CreateIndex
CREATE INDEX "Land_estateId_idx" ON "Land"("estateId");

-- CreateIndex
CREATE INDEX "Development_projectId_status_idx" ON "Development"("projectId", "status");

-- CreateIndex
CREATE INDEX "Development_estateId_idx" ON "Development"("estateId");

-- CreateIndex
CREATE INDEX "DevelopmentLand_projectId_idx" ON "DevelopmentLand"("projectId");

-- CreateIndex
CREATE INDEX "Phase_projectId_idx" ON "Phase"("projectId");

-- CreateIndex
CREATE INDEX "Phase_developmentId_idx" ON "Phase"("developmentId");

-- CreateIndex
CREATE INDEX "Milestone_projectId_idx" ON "Milestone"("projectId");

-- CreateIndex
CREATE INDEX "Milestone_phaseId_status_idx" ON "Milestone"("phaseId", "status");

-- CreateIndex
CREATE INDEX "Milestone_targetDate_idx" ON "Milestone"("targetDate");

-- CreateIndex
CREATE INDEX "ProgressUpdate_projectId_idx" ON "ProgressUpdate"("projectId");

-- CreateIndex
CREATE INDEX "ProgressUpdate_developmentId_idx" ON "ProgressUpdate"("developmentId");

-- CreateIndex
CREATE INDEX "ProgressUpdate_phaseId_idx" ON "ProgressUpdate"("phaseId");

-- CreateIndex
CREATE INDEX "SpendRecord_projectId_idx" ON "SpendRecord"("projectId");

-- CreateIndex
CREATE INDEX "SpendRecord_developmentId_idx" ON "SpendRecord"("developmentId");

-- CreateIndex
CREATE INDEX "SpendRecord_phaseId_idx" ON "SpendRecord"("phaseId");

-- CreateIndex
CREATE INDEX "Contractor_projectId_idx" ON "Contractor"("projectId");

-- CreateIndex
CREATE INDEX "DevelopmentContractor_projectId_idx" ON "DevelopmentContractor"("projectId");

-- CreateIndex
CREATE INDEX "Building_projectId_idx" ON "Building"("projectId");

-- CreateIndex
CREATE INDEX "Unit_projectId_status_idx" ON "Unit"("projectId", "status");

-- CreateIndex
CREATE INDEX "Unit_estateId_idx" ON "Unit"("estateId");

-- CreateIndex
CREATE INDEX "Unit_developmentId_idx" ON "Unit"("developmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_projectId_unitRef_key" ON "Unit"("projectId", "unitRef");

-- CreateIndex
CREATE INDEX "BuyerContact_projectId_idx" ON "BuyerContact"("projectId");

-- CreateIndex
CREATE INDEX "SaleAllocation_projectId_commercialStatus_idx" ON "SaleAllocation"("projectId", "commercialStatus");

-- CreateIndex
CREATE INDEX "SaleAllocation_projectId_paymentStatus_idx" ON "SaleAllocation"("projectId", "paymentStatus");

-- CreateIndex
CREATE INDEX "SaleAllocation_unitId_idx" ON "SaleAllocation"("unitId");

-- CreateIndex
CREATE INDEX "SaleAllocation_landId_idx" ON "SaleAllocation"("landId");

-- CreateIndex
CREATE INDEX "PaymentRecord_projectId_idx" ON "PaymentRecord"("projectId");

-- CreateIndex
CREATE INDEX "PaymentRecord_saleId_deletedAt_idx" ON "PaymentRecord"("saleId", "deletedAt");

-- CreateIndex
CREATE INDEX "Document_projectId_linkedType_linkedId_idx" ON "Document"("projectId", "linkedType", "linkedId");

-- CreateIndex
CREATE INDEX "StatusActivityLog_projectId_timestamp_idx" ON "StatusActivityLog"("projectId", "timestamp");

-- CreateIndex
CREATE INDEX "StatusActivityLog_recordType_recordId_idx" ON "StatusActivityLog"("recordType", "recordId");

-- CreateIndex
CREATE INDEX "Notification_projectId_type_idx" ON "Notification"("projectId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_type_recordType_recordId_key" ON "Notification"("type", "recordType", "recordId");
